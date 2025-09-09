import { useEffect, useState } from 'react';

import { getLabelByAccel, getValues } from './utils';

import styles from './HotkeyInput.module.scss';

export type HotkeyInputProps = {
  value?: string;
  onChange?: (hotKey: string) => void;
  placeholder?: string;
};

export const HotkeyInput = ({
  value = '',
  placeholder = 'Press hotkey',
  onChange = () => {},
}: HotkeyInputProps) => {
  const [val, setVal] = useState(value);

  useEffect(() => {
    const val = getLabelByAccel(value);

    setVal(val);
  }, [value]);

  const keyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const values = getValues(e);

    if (!values) {
      return;
    }

    const { ui, accel } = values;

    const val = ui ?? '';

    setVal(val);
    onChange(accel);
  };

  return (
    <input
      className={styles.Input}
      value={val}
      placeholder={placeholder}
      readOnly
      onKeyDown={keyDownHandler}
    />
  );
};
