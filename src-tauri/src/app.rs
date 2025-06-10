//#region tauri uses
#[rustfmt::skip]
use tauri::{
  // traits
  Emitter,
  Manager,

  // enums
  WindowEvent,

  // structs
  App,
  AppHandle,
  Window,
};
//#endregion tauri uses

//#region tauri plugins uses
use tauri::menu::{MenuItem, Menu, MenuEvent};

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

use crate::log_err_or_return;
use crate::log_err_and_continue;
use crate::log_err_and_ignore;

#[tauri::command]
fn clean_clipboard() -> Result<String, String> {
  let mut clipboard = arboard::Clipboard::new().map_err(|e| e.to_string())?;

  let text = clipboard.get_text().map_err(|e| e.to_string())?;

  clipboard.set_text(text.clone()).map_err(|e| e.to_string())?;

  Ok(text)
}

fn get_shortcut_hot_key(code: Code) -> Shortcut {
  Shortcut::new(Some(Modifiers::META | Modifiers::ALT), code)
}

pub fn run_app() -> Result<(), String> {
  let tauri_builder_default = tauri::Builder::default();
  let tauri_plugin_global_shortcut_builder = GlobalShortcutBuilder::new();

  #[rustfmt::skip]
  let tauri_plugin_global_shortcut_handler = |app: &AppHandle,
                                              shortcut: &Shortcut,
                                              event: ShortcutEvent| {
      let default_shortcut = get_shortcut_hot_key(Code::KeyV);

      let is_correct_shortcut = shortcut == &default_shortcut;
      let is_correct_state = event.state == ShortcutState::Pressed;

      if is_correct_shortcut && is_correct_state {
        let msg = log_err_and_continue!(clean_clipboard(), "Error while clean clipboard")
          .unwrap();

        let _ = app.emit("clean_clipboard", &msg);

        let notification = app.notification()
          .builder()
          .title("clean-paste")
          .body("Formatting deleted!");

        log_err_and_ignore!(notification.show(), "Couldn't show a notification");
      }
    };

  let tauri_plugin_global_shortcut_plugin = tauri_plugin_global_shortcut_builder
    .with_handler(tauri_plugin_global_shortcut_handler)
    .build();

  let setup = |app: &mut App| {
    #[cfg(desktop)]
    {
      let default_shortcut = get_shortcut_hot_key(Code::KeyV);

      let app_with_shortcut = app.global_shortcut().register(default_shortcut);

      log_err_or_return!(app_with_shortcut, "Couldn't register the shortcut");

      let quit_i = log_err_or_return!(
        MenuItem::with_id(app, "quit", "Quit", true, None::<&str>),
        "Couldn't create menu item Quit"
      );

      let menu = log_err_or_return!(Menu::with_items(app, &[&quit_i]), "Couldn't create tray menu");

      // todo: вернуть правильный путь, пока это только для проверки работы логирования
      let icon = log_err_or_return!(
        tauri::image::Image::from_path("icons/32x32_1.png"),
        "Couldn't load tray icon"
      );

      fn icon_click_handler(tray: &TrayIcon<tauri::Wry>, button: MouseButton) {
        if button == MouseButton::Left {
          let app = tray.app_handle();

          #[cfg(not(target_os = "macos"))]
          {
            if let Some(webview_window) = app.get_webview_window("main") {
              let _ = webview_window.show();
              let _ = webview_window.set_focus();
            }
          }

          #[cfg(target_os = "macos")]
          {
            tauri::AppHandle::show(&app.app_handle()).unwrap();
          }
        }
      }

      fn on_tray_icon_event(tray: &TrayIcon<tauri::Wry>, event: TrayIconEvent) {
        if let TrayIconEvent::Click { button, .. } = event {
          icon_click_handler(&tray, button);
        }
      }

      fn on_menu_event(app: &AppHandle, event: MenuEvent) {
        match event.id.as_ref() {
          "quit" => {
            app.exit(0);
          }
          _ => {
            tracing::error!("Menu item {:?} not handled", event.id);
          }
        }
      }

      let tray_icon_ready = TrayIconBuilder::new()
        .icon(icon)
        .tooltip("clean paste")
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_tray_icon_event(|tray: &TrayIcon<tauri::Wry>, event| {
          on_tray_icon_event(tray, event);
        })
        .on_menu_event(|app, event| {
          on_menu_event(app, event);
        });

      log_err_and_continue!(tray_icon_ready.build(app), "Couldn't create tray").unwrap();

      Ok(())
    }
  };

  fn on_window_event(window: &Window, event: &WindowEvent) {
    match event {
      WindowEvent::CloseRequested { api, .. } => {
        #[cfg(not(target_os = "macos"))]
        {
          window.hide().unwrap();
        }

        #[cfg(target_os = "macos")]
        {
          tauri::AppHandle::hide(&window.app_handle()).unwrap();
        }

        api.prevent_close();
      }
      _ => {
        tracing::error!("Error while preventing close");
      }
    }
  }

  let tauri_ready = tauri_builder_default
    .plugin(tauri_plugin_global_shortcut_plugin)
    .plugin(tauri_plugin_notification::init())
    .invoke_handler(tauri::generate_handler![clean_clipboard])
    .setup(setup)
    .on_window_event(|window, event| {
      on_window_event(window, event);
    });

  log_err_or_return!(
    tauri_ready.run(tauri::generate_context!()),
    "Error while starting the app"
  );

  Ok(())
}

// todo: превратить функции в замыкания
/*
чтобы вместо:
.on_window_event(|window, event| {
      on_window_event(window, event);
    });

писать:
.on_window_event(on_window_event(window, event)
*/

// todo: при клике на иконку трея левой кнопкой мыши делать очистку форматирования
// todo: добавить возможность переназначать горячие клавиши
// todo: добавить информацию о разработчике и лицензии, ссылки

// todo: попробовать автоматическую компиляцию под разные платформы с помощью Github
