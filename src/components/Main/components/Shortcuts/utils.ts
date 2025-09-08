import { type Settings, getCmdOrCtrl } from 'utils';

function getLabel(hotkey: string, radioHotkey: string) {
  return `${radioHotkey} and ${hotkey}`;
}

export function getLabelForShortcuts(settings: Settings) {
  const { hotkey, radioHotkey } = settings;

  const defaultKey = getCmdOrCtrl();

  const safeHotkey = hotkey ?? `${defaultKey} + Shift + V`;
  const safeRadioHotkey = radioHotkey ?? `Double ${defaultKey}`;

  return getLabel(safeHotkey, safeRadioHotkey);
}
