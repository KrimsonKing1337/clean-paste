//#region Rust uses
use std::io::Read;
use std::io::{self, BufRead, BufReader, Write};
use std::thread::{self, sleep};
use std::time::{Duration, Instant};
use std::fs::{self, OpenOptions};
use std::path::PathBuf;
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

use rdev::{Event, EventType, Key, listen};
use device_query::{DeviceQuery, DeviceState, Keycode};
use interprocess::local_socket::{prelude::*, GenericNamespaced, ListenerOptions, Stream};

use crate::{log_err_and_continue, log_err_and_ignore};

#[tauri::command]
pub fn clean_clipboard() -> Result<String, String> {
  let mut clipboard = arboard::Clipboard::new().map_err(|e| e.to_string())?;

  let text = clipboard.get_text().map_err(|e| e.to_string())?;

  clipboard
    .set_text(text.clone())
    .map_err(|e| e.to_string())?;

  Ok(text)
}

pub struct ShowNotification {
  pub app_handle: AppHandle,
  pub msg: String,
  pub error_msg: String,
}

pub fn show_notification(params: ShowNotification) -> Result<(), String> {
  let ShowNotification {
    app_handle,
    msg,
    error_msg,
  } = params;

  let notification = app_handle
    .notification()
    .builder()
    .title("clean-paste")
    .body(msg);

  log_err_and_ignore!(notification.show(), error_msg);

  Ok(())
}

pub fn do_clean_clipboard(app_handle: &AppHandle) -> Result<(), String> {
  let msg = log_err_and_continue!(clean_clipboard(), "Error while clean clipboard")?;

  let _ = app_handle.emit("clean_clipboard", &msg);

  let show_notification_params = ShowNotification {
    app_handle: app_handle.clone(),
    msg: "Formatting deleted!".to_string(),
    error_msg: "Couldn't show formatting deleted notification".to_string(),
  };

  show_notification(show_notification_params)?;

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
  let ns_name = name
    .to_ns_name::<GenericNamespaced>()
    .map_err(|e| e.to_string())?;

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
  thread::spawn({
    move || {
      let name = "clean-paste-socket";
      let ns_name = name
        .to_ns_name::<GenericNamespaced>()
        .expect("invalid socket name");

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

fn is_target_key(key: &Key) -> bool {
  #[cfg(target_os = "macos")]
  return *key == Key::MetaLeft || *key == Key::MetaRight;

  #[cfg(not(target_os = "macos"))]
  return *key == Key::ControlLeft || *key == Key::ControlRight;
}

fn no_other_modifiers_pressed(target_key: &Key) -> bool {
  let device_state = DeviceState::new();
  let keys = device_state.get_keys();

  let is_ctrl = *target_key == Key::ControlLeft || *target_key == Key::ControlRight;
  let is_meta = *target_key == Key::MetaLeft || *target_key == Key::MetaRight;

  if is_ctrl {
    !keys.contains(&Keycode::LShift)
      && !keys.contains(&Keycode::RShift)
      && !keys.contains(&Keycode::LAlt)
      && !keys.contains(&Keycode::RAlt)
      && !keys.contains(&Keycode::LMeta)
      && !keys.contains(&Keycode::RMeta)
  } else if is_meta {
    !keys.contains(&Keycode::LShift)
      && !keys.contains(&Keycode::RShift)
      && !keys.contains(&Keycode::LAlt)
      && !keys.contains(&Keycode::RAlt)
      && !keys.contains(&Keycode::LControl)
      && !keys.contains(&Keycode::RControl)
  } else {
    true
  }
}

pub fn listen_for_double_key<F>(mut on_double_press: F)
where
  F: FnMut() + Send + 'static,
{
  thread::spawn(move || {
    let mut last_release = Instant::now() - Duration::from_secs(1);
    let mut awaiting_second_press = false;

    if let Err(err) = listen(move |event: Event| {
      match event.event_type {
        EventType::KeyRelease(key) if is_target_key(&key) && no_other_modifiers_pressed(&key) => {
          let now = Instant::now();

          if now.duration_since(last_release) < Duration::from_millis(300) && awaiting_second_press {
            on_double_press();

            awaiting_second_press = false;
          } else {
            awaiting_second_press = true;
          }

          last_release = now;
        }
        EventType::KeyRelease(_) if awaiting_second_press => {
          // если во время ожидания нажата не та клавиша — сброс
          awaiting_second_press = false;
        }

        _ => {}
      }
    }) {
      tracing::error!("Error in double key listener: {:?}", err);
    }
  });
}

fn get_ready_file_path() -> PathBuf {
  dirs::data_local_dir()
    .unwrap_or_else(std::env::temp_dir)
    .join("clean-paste")
    .join("ready.txt")
}

pub fn has_flag(flag: &str) -> io::Result<bool> {
  let path = get_ready_file_path();

  if !path.exists() {
    return Ok(false);
  }

  let file = fs::File::open(path)?;
  let reader = BufReader::new(file);

  for line in reader.lines() {
    if line?.trim() == flag {
      return Ok(true);
    }
  }

  Ok(false)
}

pub fn set_flag(flag: &str) -> io::Result<()> {
  if has_flag(flag)? {
    return Ok(());
  }

  let path = get_ready_file_path();

  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent)?;
  }

  let mut file = OpenOptions::new().create(true).append(true).open(path)?;

  writeln!(file, "{}", flag)?;
  Ok(())
}
