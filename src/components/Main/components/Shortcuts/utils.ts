import { type Settings, getCmdOrCtrl } from 'utils';
import { getLabelByAccel } from 'components/Config/components/HotkeyInput/utils.ts';

function getLabel(hotkey: string, doubleHotkey: string) {
  return `${doubleHotkey} and ${hotkey}`;
}

export function getLabelForShortcuts(settings: Settings) {
  const { hotkey, doubleHotkey } = settings;

  const defaultKey = getCmdOrCtrl();
  const hotKeyByAccel = getLabelByAccel(hotkey || defaultKey);

  const safeHotkey = hotKeyByAccel ?? `${defaultKey} + Shift + V`;
  const safeDoubleHotkey = doubleHotkey ? `Double ${doubleHotkey}` : `Double ${defaultKey}`;

  return getLabel(safeHotkey, safeDoubleHotkey);
}
