//#region Rust uses
use std::io::Read;
use std::io::Write;
use std::thread::sleep;
use std::time::Duration;
//#endregion Rust uses

//#region tauri uses
#[rustfmt::skip]
use tauri::{
  // traits
  Emitter,
  Manager,

  // types
  Wry,

  // enums
  WindowEvent,

  // structs
  App,
  AppHandle,
  Window,
};
//#endregion tauri uses

//#region tauri plugins uses
use tauri::menu::{MenuItem, Menu, MenuEvent, IsMenuItem};

use tauri_plugin_notification::NotificationExt;

#[rustfmt::skip]
use tauri::tray::{
  // enums
  MouseButton,
  TrayIconEvent,

  // structs
  TrayIcon,
  TrayIconBuilder,
};

#[rustfmt::skip]
use tauri_plugin_global_shortcut::{
  // traits
  GlobalShortcutExt,

  // enums
  Code,
  ShortcutState,

  // structs
  Builder as GlobalShortcutBuilder,
  Modifiers,
  Shortcut,
  ShortcutEvent,
};
//#endregion

use single_instance::SingleInstance;
use interprocess::local_socket::{prelude::*, GenericNamespaced, ListenerOptions, Stream};

use crate::{listen_for_double_ctrl_or_cmd::listen_for_double_ctrl_or_cmd};
use crate::{log_err_or_return, log_err_and_continue, log_err_and_ignore};

#[tauri::command]
fn clean_clipboard() -> Result<String, String> {
  let mut clipboard = arboard::Clipboard::new().map_err(|e| e.to_string())?;

  let text = clipboard.get_text().map_err(|e| e.to_string())?;

  clipboard.set_text(text.clone()).map_err(|e| e.to_string())?;

  Ok(text)
}

fn do_clean_clipboard(app_handle: &AppHandle) -> Result<(), String> {
  let msg = log_err_and_continue!(clean_clipboard(), "Error while clean clipboard")?;

  let _ = app_handle.emit("clean_clipboard", &msg);

  let notification = app_handle
    .notification()
    .builder()
    .title("clean-paste")
    .body("Formatting deleted!");

  log_err_and_ignore!(notification.show(), "Couldn't show a notification");

  Ok(())
}

fn get_default_shortcut() -> Shortcut {
  if cfg!(target_os = "macos") {
    Shortcut::new(Some(Modifiers::META | Modifiers::ALT), Code::KeyV)
  } else {
    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyV)
  }
}

fn send_cleanup_signal() -> Result<(), String> {
  let name = "clean-paste-socket";
  let ns_name = name.to_ns_name::<GenericNamespaced>().map_err(|e| e.to_string())?;

  for _ in 0..5 {
    match Stream::connect(ns_name.clone()) {
      Ok(mut stream) => {
        stream.write_all(&[1]).map_err(|e| e.to_string())?;

        return Ok(());
      }
      Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
        sleep(Duration::from_millis(100));

        continue;
      }
      Err(e) => return Err(e.to_string()),
    }
  }

  Err("Couldn't connect to the IPC stream after several tryings".to_string())
}

fn spawn_socket(app_handle: AppHandle) {
  std::thread::spawn({
    move || {
      let name = "clean-paste-socket";
      let ns_name = name.to_ns_name::<GenericNamespaced>().expect("invalid socket name");

      let listener = match ListenerOptions::new().name(ns_name).create_sync() {
        Ok(listener) => listener,
        Err(err) => {
          tracing::error!("Failed to bind IPC socket: {:?}", err);

          return;
        }
      };

      tracing::info!("IPC listener started");

      for conn in listener.incoming() {
        match conn {
          Ok(mut stream) => {
            let mut buf = [0u8; 1];

            if stream.read_exact(&mut buf).is_ok() {
              let _ = do_clean_clipboard(&app_handle);
            }
          }
          Err(e) => {
            tracing::error!("IPC connection failed: {:?}", e);
          }
        }
      }
    }
  });
}

pub fn run_app() -> Result<(), String> {
  let instance = SingleInstance::new("clean-paste-instance").unwrap();

  if !instance.is_single() {
    send_cleanup_signal()?;

    return Ok(());
  }

  let tauri_builder_default = tauri::Builder::default();
  let tauri_plugin_global_shortcut_builder = GlobalShortcutBuilder::new();

  let tauri_plugin_global_shortcut_handler = |app_handle: &AppHandle, shortcut: &Shortcut, event: ShortcutEvent| {
    let default_shortcut = get_default_shortcut();

    let is_correct_shortcut = shortcut == &default_shortcut;
    let is_correct_state = event.state == ShortcutState::Pressed;

    if is_correct_shortcut && is_correct_state {
      do_clean_clipboard(app_handle).unwrap();
    }
  };

  let tauri_plugin_global_shortcut_plugin = tauri_plugin_global_shortcut_builder
    .with_handler(tauri_plugin_global_shortcut_handler)
    .build();

  let setup = |app: &mut App| {
    let app_handle = app.app_handle().clone();

    spawn_socket(app_handle.clone());

    let default_shortcut = get_default_shortcut();
    let app_with_shortcut = app.global_shortcut().register(default_shortcut);

    log_err_or_return!(app_with_shortcut, "Couldn't register the shortcut");

    let menu_item_open = log_err_or_return!(
        MenuItem::with_id(app, "open", "Open", true, None::<&str>),
        "Couldn't create menu item Open"
      );

    let menu_item_quit = log_err_or_return!(
        MenuItem::with_id(app, "quit", "Quit", true, None::<&str>),
        "Couldn't create menu item Quit"
      );

    type MenuIteSlice<'a> = &'a dyn IsMenuItem<Wry>;
    type MenuItemsSlice<'a> = &'a [MenuIteSlice<'a>];

    let menu_items: MenuItemsSlice = &[&menu_item_open as MenuIteSlice, &menu_item_quit as MenuIteSlice];

    let menu = log_err_or_return!(Menu::with_items(app, menu_items), "Couldn't create tray menu");

    let icon = log_err_or_return!(
        tauri::image::Image::from_path("icons/32x32.png"),
        "Couldn't load tray icon"
      );

    let tray_icon_event_handler = move |tray: &TrayIcon<Wry>, event: TrayIconEvent| {
      if let TrayIconEvent::Click { button, .. } = event {
        if button == MouseButton::Left {
          let app_handle = tray.app_handle();
          let _ = do_clean_clipboard(&app_handle);
        }
      }
    };

    let menu_event_handler = move |app: &AppHandle, event: MenuEvent | {
      match event.id.as_ref() {
        "quit" => {
          app.exit(0);
        }
        "open" => {
          #[cfg(not(target_os = "macos"))]
          {
            if let Some(webview_window) = app.app_handle().get_webview_window("main") {
              let _ = webview_window.show();
              let _ = webview_window.set_focus();
            }
          }

          #[cfg(target_os = "macos")]
          {
            tauri::AppHandle::show(&app.app_handle()).unwrap();
          }
        }
        _ => {
          tracing::error!("Menu item {:?} not handled", event.id);
        }
      }
    };

    let tray_icon_ready = TrayIconBuilder::new()
      .icon(icon)
      .tooltip("clean paste")
      .menu(&menu)
      .show_menu_on_left_click(false)
      .on_tray_icon_event(tray_icon_event_handler)
      .on_menu_event(menu_event_handler);

    log_err_and_continue!(tray_icon_ready.build(app), "Couldn't create tray").unwrap();

    listen_for_double_ctrl_or_cmd({
      let app_handle = app_handle.clone();

      move || {
        do_clean_clipboard(&app_handle).unwrap();
      }
    });

    Ok(())
  };

  let window_event_handler = move |window: &Window, event: &WindowEvent| {
    match event {
      WindowEvent::CloseRequested { api, .. } => {
        #[cfg(not(target_os = "macos"))]
        {
          log_err_and_continue!(window.hide(), "Failed to hide window").unwrap();
        }

        #[cfg(target_os = "macos")]
        {
          log_err_and_continue!(tauri::AppHandle::hide(&window.app_handle()), "Failed to hide window").unwrap();
        }

        api.prevent_close();
      }
      _ => {}
    }
  };

  let tauri_ready = tauri_builder_default
    .plugin(tauri_plugin_global_shortcut_plugin)
    .plugin(tauri_plugin_notification::init())
    .invoke_handler(tauri::generate_handler![clean_clipboard])
    .setup(setup)
    .on_window_event(window_event_handler);

  log_err_or_return!(
    tauri_ready.run(tauri::generate_context!()),
    "Error while starting the app"
  );

  Ok(())
}

// todo: добавить возможность переназначать горячие клавиши
// todo: добавить информацию о разработчике и лицензии, ссылки

// todo: попробовать автоматическую компиляцию под разные платформы с помощью Github
