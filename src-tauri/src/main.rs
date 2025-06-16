#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tracing_error::ErrorLayer;
use tracing_appender::rolling;

mod app;
use app::run_app;

mod utils;
mod constants;

fn main() -> Result<(), String> {
  let log_dir = dirs::data_local_dir()
    .unwrap_or_else(|| std::env::temp_dir())
    .join("clean-paste");

  std::fs::create_dir_all(&log_dir).unwrap();

  let file_appender = rolling::daily(log_dir, "log");
  let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);

  tracing_subscriber::registry()
      .with(ErrorLayer::default())
      .with(tracing_subscriber::fmt::layer().with_writer(non_blocking).with_ansi(false))
      .init();

  tracing::info!("App started successfully");
  
  if let Err(err) = run_app() {
    tracing::error!("{:?}", err);
    
    Err(err)?;
  }

  drop(guard);

  Ok(())
}
