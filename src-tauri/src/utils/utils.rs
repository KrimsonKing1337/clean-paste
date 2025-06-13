//#region Rust uses
use std::io::Read;
use std::io::Write;
use std::thread::sleep;
use std::time::{Duration, Instant};
//#endregion Rust uses

//#region tauri uses
#[rustfmt::skip]
use tauri::{
  // traits
  Emitter,

  // structs
  AppHandle,
};
//#endregion tauri uses

use tauri_plugin_notification::NotificationExt;

#[rustfmt::skip]
use tauri_plugin_global_shortcut::{
  // enums
  Code,

  // structs
  Modifiers,
  Shortcut,
};

use rdev::{EventType, Key, listen};
use interprocess::local_socket::{prelude::*, GenericNamespaced, ListenerOptions, Stream};

use crate::{log_err_and_continue, log_err_and_ignore};

#[tauri::command]
pub fn clean_clipboard() -> Result<String, String> {
  let mut clipboard = arboard::Clipboard::new().map_err(|e| e.to_string())?;

  let text = clipboard.get_text().map_err(|e| e.to_string())?;

  clipboard.set_text(text.clone()).map_err(|e| e.to_string())?;

  Ok(text)
}

pub fn do_clean_clipboard(app_handle: &AppHandle) -> Result<(), String> {
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

pub fn get_default_shortcut() -> Shortcut {
  if cfg!(target_os = "macos") {
    Shortcut::new(Some(Modifiers::META | Modifiers::ALT), Code::KeyV)
  } else {
    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyV)
  }
}

pub fn send_cleanup_signal() -> Result<(), String> {
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

pub fn spawn_socket(app_handle: AppHandle) {
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

#[cfg(target_os = "macos")]
const TARGET_KEY: Key = Key::MetaLeft;

#[cfg(not(target_os = "macos"))]
const TARGET_KEY: Key = Key::ControlLeft;

pub fn listen_for_double_ctrl_or_cmd<F>(mut on_double_press: F)
where F: FnMut() + Send + 'static,
{
  let mut last_press = Instant::now() - Duration::from_secs(1);

  std::thread::spawn(move || {
    if let Err(err) = listen(move |event| {
      if let EventType::KeyPress(key) = event.event_type {
        if key == TARGET_KEY {
          let now = Instant::now();

          if now.duration_since(last_press) < Duration::from_millis(300) {
            on_double_press();
          }

          last_press = now;
        }
      }
    }) {
      tracing::error!("Error in Ctrl/Cmd listener: {:?}", err);
    }
  });
}
