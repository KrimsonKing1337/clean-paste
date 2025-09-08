import { type } from '@tauri-apps/plugin-os';

export function getPlatformType() {
  return type();
}

export function getCmdOrCtrl() {
  const platformType = getPlatformType();

  return platformType === 'macos' ? 'Cmd' : 'Ctrl';
}
