use std::time::{Duration, Instant};

use rdev::{EventType, Key, listen};

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
