import { invoke } from '@tauri-apps/api/core';

export type Settings = {
  hotkey?: string;
  doubleHotkey?: string;
}

export function getSettingsDirPath(): Promise<string> {
  return invoke('settings_path_cmd');
}

export async function loadSettings() {
  const currentSettingsJson = await invoke('load_settings') as unknown as string;
  const currentSettings = JSON.parse(currentSettingsJson);

  return {
    hotkey: currentSettings.hotkey,
    doubleHotkey: currentSettings.double_hotkey,
  }
}

export async function saveSettings(value: Settings) {
  const currentSettings = await loadSettings();

  const currentSettingsSafe = {
    hotkey: currentSettings.hotkey,
    double_hotkey: currentSettings.doubleHotkey,
  };

  const newValue = {
    ...currentSettingsSafe,
    hotkey: value.hotkey,
    double_hotkey: value.doubleHotkey,
  };

  const newValueJson = JSON.stringify(newValue);

  return await invoke('save_settings', { content: newValueJson });
}
