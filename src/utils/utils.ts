import { type } from '@tauri-apps/plugin-os';

export function getPlatformType() {
  return type();
}
