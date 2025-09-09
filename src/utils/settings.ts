import { invoke } from '@tauri-apps/api/core';

export type Settings = {
  hotkey?: string;
  doubleHotkey?: string;
}

export function getSettingsDirPath(): Promise<string> {
  return invoke('settings_path_cmd');
}

export async function loadSettings() {
  const settingsCurrentJson = await invoke('load_settings') as unknown as string;

  return JSON.parse(settingsCurrentJson);
}

export async function saveSettings(value: Settings) {
  const currentSettings = await loadSettings();

  const newValue = {
    ...currentSettings,
    ...value,
  };

  const newValueJson = JSON.stringify(newValue);

  await invoke('save_settings', { content: newValueJson });

  return newValue;
}
