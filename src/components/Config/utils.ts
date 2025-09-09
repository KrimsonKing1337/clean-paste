import { type Settings, getPlatformType } from 'utils';

export type DoublePressOption = {
  label: string;
  value: string;
};

export const doublePressOptions: DoublePressOption[] = [
  {
    label: 'None',
    value: 'None',
  },
  {
    label: 'Double Ctrl',
    value: 'Control',
  },
  {
    label: 'Double Shift',
    value: 'Shift',
  },
  {
    label: 'Double Alt',
    value: 'Alt',
  },
  {
    label: 'Double Opt',
    value: 'Opt',
  },
  {
    label: 'Double Cmd',
    value: 'Command',
  },
];

export function getDoubleHotKeyOptionByValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  for (const optionCur of doublePressOptions) {
    if (optionCur.value === value) {
      return optionCur;
    }
  }

  return null;
}

export function getCheckedDoubleHotkey(settings: Settings) {
  const platformType = getPlatformType();

  const defaultHotkey = platformType === 'macos'
    ? {
      label: 'Double Cmd',
      value: 'Command',
    } : {
      label: 'Double Ctrl',
      value: 'Control',
    };

  const doubleHotKeyOptionByValue = getDoubleHotKeyOptionByValue(settings.doubleHotkey);

  return  doubleHotKeyOptionByValue ? doubleHotKeyOptionByValue : defaultHotkey;
}
