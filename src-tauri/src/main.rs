#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tracing_error::ErrorLayer;
use tracing_appender::rolling;

mod app;
use app::run_app;

mod utils;

fn main() -> Result<(), String> {
  // rolling log file
  let file_appender = rolling::daily("logs", "error.log");
  let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);

  tracing_subscriber::registry()
      .with(ErrorLayer::default())
      // .with(tracing_subscriber::fmt::layer().with_writer(non_blocking).compact().with_ansi(false))
      .with(tracing_subscriber::fmt::layer().with_writer(non_blocking).with_ansi(false))
      .init();

  tracing::info!("Приложение запущено");

  // запуск приложения
  if let Err(err) = run_app() {
    tracing::error!("{:?}", err);
    
    Err(err)?;
  }

  tracing::info!("Завершаю работу, дропаю guard...");
  drop(guard);

  Ok(())
}
