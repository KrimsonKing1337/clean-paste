export type DoublePressOption = {
  label: string;
  isDefault?: boolean;
};

export const doublePressOptions: DoublePressOption[] = [
  {
    label: 'Disable',
  },
  {
    label: 'Double Ctrl',
    isDefault: true, // todo: брать из настроек пользователя. если ничего нет - тогда использовать это
  },
  {
    label: 'Double Shift',
  },
  {
    label: 'Double Shift',
  },
  {
    label: 'Double CapsLock',
  },
  {
    label: 'Double Alt',
  },
  {
    label: 'Double Opt',
  },
  {
    label: 'Double Cmd',
  },
];
