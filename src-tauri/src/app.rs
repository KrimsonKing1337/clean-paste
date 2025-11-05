//#region tauri uses
#[rustfmt::skip]
use tauri::{
  // traits
  App,
  AppHandle,

  // enums
  Manager,

  // structs
  Window,
  WindowEvent,
  Wry,
};
//#endregion tauri uses

//#region tauri plugins uses
use tauri::menu::{
  Menu,
  MenuEvent,
  MenuItem,

  IsMenuItem
};

#[rustfmt::skip]
use tauri::tray::{
  // enums
  MouseButton,
  MouseButtonState,
  TrayIcon,

  // structs
  TrayIconBuilder,
  TrayIconEvent,
};

#[rustfmt::skip]
use tauri_plugin_global_shortcut::{
  // traits
  Builder as GlobalShortcutBuilder,

  // enums
  GlobalShortcutExt,

  // structs
  Shortcut,
  ShortcutEvent,
  ShortcutState,
};

#[rustfmt::skip]
use tauri_plugin_os;
//#endregion

use single_instance::SingleInstance;

use crate::{log_err_or_return, log_err_and_continue, utils, constants};

#[rustfmt::skip]
use utils::utils::{
  ShowNotification,

  do_clean_clipboard,
  send_cleanup_signal,
  spawn_socket,
  listen_for_double_key,
  show_notification,
  has_flag,
  set_flag,
};

use constants::{FLAG_FIRST_CLOSED, FLAG_FIRST_OPENED};

pub fn run_app() -> Result<(), String> {
  let instance = SingleInstance::new("clean-paste-instance").unwrap();

  if !instance.is_single() {
    send_cleanup_signal()?;

    return Ok(());
  }

  let tauri_builder_default = tauri::Builder::default();
  let tauri_plugin_global_shortcut_builder = GlobalShortcutBuilder::new();

  #[rustfmt::skip]
  let tauri_plugin_global_shortcut_handler = |
    app_handle: &AppHandle,
    shortcut: &Shortcut,
    event: ShortcutEvent| {
      if event.state != ShortcutState::Pressed {
        return;
      }

      if let Some(current) = utils::utils::get_current_shortcut() {
        if &current == shortcut {
          if let Err(e) = utils::utils::do_clean_clipboard(app_handle) {
            tracing::error!("Failed to clean clipboard: {}", e);
          }
        }
      }
    };

  let tauri_plugin_global_shortcut_plugin = tauri_plugin_global_shortcut_builder
    .with_handler(tauri_plugin_global_shortcut_handler)
    .build();

  let setup = |app: &mut App| {
    let app_handle = app.app_handle().clone();

    spawn_socket(app_handle.clone());

    let default_shortcut = utils::utils::get_default_shortcut();
    utils::utils::init_current_shortcut(default_shortcut);
    utils::utils::init_current_double_key(Some(utils::utils::DoubleKey::Ctrl));

    let settings_str = utils::utils::load_settings(app_handle.clone()).ok().flatten();

    if let Some(content) = settings_str {
      if let Err(e) = utils::utils::apply_settings_from_str(&app_handle, &content) {
        tracing::error!("Failed to apply settings from file: {}", e);
      }
    }

    if utils::utils::get_current_shortcut().is_none() {
      let default_shortcut = utils::utils::get_default_shortcut();

      if let Err(e) = app.global_shortcut().register(default_shortcut) {
        tracing::error!("Couldn't register default shortcut: {}", e);
      } else {
        utils::utils::init_current_shortcut(default_shortcut);
      }
    }

    if utils::utils::get_current_double_key().is_none() {
      utils::utils::init_current_double_key(Some(utils::utils::DoubleKey::Ctrl));
    }

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

    let menu = log_err_or_return!(
      Menu::with_items(app, menu_items),
      "Couldn't create tray menu"
    );

    const ICON_BYTES: &[u8] = include_bytes!("../icons/32x32.png");

    let icon = log_err_or_return!(
      tauri::image::Image::from_bytes(ICON_BYTES),
      "Couldn't load tray icon"
    );

    let tray_icon_event_handler = move |tray: &TrayIcon<Wry>, event: TrayIconEvent| {
      if let TrayIconEvent::Click {
        button,
        button_state,
        ..
      } = event
      {
        if button == MouseButton::Left && button_state == MouseButtonState::Down {
          let app_handle = tray.app_handle();
          let _ = do_clean_clipboard(&app_handle);
        }
      }
    };

    let menu_event_handler = move |app: &AppHandle, event: MenuEvent| match event.id.as_ref() {
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
    };

    let tray_icon_ready = TrayIconBuilder::new()
      .icon(icon)
      .tooltip("clean paste")
      .menu(&menu)
      .show_menu_on_left_click(false)
      .on_tray_icon_event(tray_icon_event_handler)
      .on_menu_event(menu_event_handler);

    log_err_and_continue!(tray_icon_ready.build(app), "Couldn't create tray").unwrap();

    listen_for_double_key({
      let app_handle = app_handle.clone();

      move || {
        do_clean_clipboard(&app_handle).unwrap();
      }
    });

    let show_notification_params = ShowNotification {
      app_handle: app_handle.clone(),
      msg: "clean-paste started!".to_string(),
      error_msg: "Couldn't show welcome notification".to_string(),
    };

    show_notification(show_notification_params)?;

    let if_first_opening = !has_flag(FLAG_FIRST_OPENED)?;

    if if_first_opening {
      let window = app.get_window("main").unwrap();

      log_err_and_continue!(window.show(), "Failed to show window").unwrap();

      set_flag(FLAG_FIRST_OPENED)?;
    }

    Ok(())
  };

  let window_event_handler = move |window: &Window, event: &WindowEvent| match event {
    WindowEvent::CloseRequested {
      api,
      ..
    } => {
      #[cfg(not(target_os = "macos"))]
      {
        log_err_and_continue!(window.hide(), "Failed to hide window").unwrap();
      }

      #[cfg(target_os = "macos")]
      {
        log_err_and_continue!(
          tauri::AppHandle::hide(&window.app_handle()),
          "Failed to hide window"
        )
          .unwrap();
      }

      let if_first_closing = !has_flag(FLAG_FIRST_CLOSED).unwrap();

      if if_first_closing {
        let show_notification_params = ShowNotification {
          app_handle: window.app_handle().clone(),
          msg: "clean-paste minimized in tray".to_string(),
          error_msg: "Couldn't show notification about minimizing".to_string(),
        };

        show_notification(show_notification_params).unwrap();

        set_flag(FLAG_FIRST_CLOSED).unwrap();
      }

      api.prevent_close();
    }
    _ => {}
  };

  let tauri_ready = tauri_builder_default
    .plugin(tauri_plugin_global_shortcut_plugin)
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      utils::utils::new_shortcut,

      utils::utils::clean_clipboard,
      utils::utils::save_settings,
      utils::utils::load_settings,
      utils::utils::settings_path_cmd,
    ])
    .setup(setup)
    .on_window_event(window_event_handler);

  log_err_or_return!(
    tauri_ready.run(tauri::generate_context!()),
    "Error while starting the app"
  );

  Ok(())
}

// todo: try automatic compilation for different platforms using Github
