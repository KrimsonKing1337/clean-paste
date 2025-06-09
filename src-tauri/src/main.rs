// Prevents an additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{App, AppHandle, Emitter, Manager};
use tauri::menu::{MenuItem, Menu};
use tauri_plugin_notification::NotificationExt;
use tauri::tray::{MouseButton, TrayIcon, TrayIconBuilder, TrayIconEvent};

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

#[tauri::command]
fn clean_clipboard() -> Result<String, String> {
  let mut clipboard = arboard::Clipboard::new().map_err(|e| e.to_string())?;
  let text = clipboard.get_text().map_err(|e| e.to_string())?;

  println!("{text}");

  clipboard.set_text(text.clone()).map_err(|e| e.to_string())?;

  Ok(text)
}

fn get_shortcut_hot_key(code: Code) -> Shortcut {
  Shortcut::new(Some(Modifiers::META | Modifiers::ALT), code)
}

fn main() {
  std::panic::set_hook(Box::new(|info| {
    eprintln!("Паника: {:?}", info);
  }));

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
        let msg = match clean_clipboard() {
          Ok(result) => result.to_string(),
          Err(err) => format!("Error: {err}"),
        };

        let _ = app.emit("clean_clipboard", &msg);

        app.notification()
          .builder()
          .title("clean-paste")
          .body("Formatting deleted!")
          .show()
          .unwrap();
      }
    };

  let tauri_plugin_global_shortcut_plugin = tauri_plugin_global_shortcut_builder
    .with_handler(tauri_plugin_global_shortcut_handler)
    .build();

  let setup = |app: &mut App| {
    #[cfg(desktop)]
    {
      let default_shortcut = get_shortcut_hot_key(Code::KeyV);

      app.global_shortcut().register(default_shortcut)?;

      let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&quit_i])?;

      TrayIconBuilder::new()
        .icon(tauri::image::Image::from_path("icons/32x32.png")?)
        .tooltip("clean paste")
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_tray_icon_event(|tray: &TrayIcon<tauri::Wry>, event| {
          if let TrayIconEvent::Click { button, .. } = event {
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
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
          "quit" => {
            app.exit(0);
          }
          _ => {
            println!("menu item {:?} not handled", event.id);
          }
        })
        .build(app)?;
    }

    Ok(())
  };

  tauri_builder_default
    .plugin(tauri_plugin_global_shortcut_plugin)
    .plugin(tauri_plugin_notification::init())
    .invoke_handler(tauri::generate_handler![clean_clipboard])
    .setup(setup)
    .on_window_event(|window, event| match event {
      tauri::WindowEvent::CloseRequested { api, .. } => {
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
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("Error while starting the app");
}
