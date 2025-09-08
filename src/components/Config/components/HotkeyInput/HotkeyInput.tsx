import { useEffect, useState } from 'react';

import { getNewVal } from './utils.ts';

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
    setVal(value);
  }, [value]);

  const setValue = (str: string) => {
    setVal(str);
    onChange(str);
  };

  const keyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const newVal = getNewVal(e);
    const val = newVal ? newVal.val : '';

    setValue(val);
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
