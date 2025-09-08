import { type Settings, getPlatformType } from 'utils';

export const doublePressOptions = [
  'None',
  'Double Ctrl',
  'Double Shift',
  'Double Alt',
  'Double Opt',
  'Double Cmd',
];

export function getCheckedDoubleHotkey(settings: Settings) {
  const platformType = getPlatformType();

  const defaultHotkey = platformType === 'macos' ? 'Double Cmd' : 'Double Ctrl';

  return settings.radioHotkey ? settings.radioHotkey : defaultHotkey;
}
