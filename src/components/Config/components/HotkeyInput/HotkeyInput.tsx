import { useState } from 'react';

import { getNewVal } from './utils.ts';

export type HotkeyInputProps = {
  value?: string;
  onChange?: (hotKey: string) => void;
  placeholder?: string;
};

export const HotkeyInput = ({
  value = '',
  onChange,
  placeholder = 'Press Hotkey',
}: HotkeyInputProps) => {
  const [val, setVal] = useState(value);

  const setValue = (str: string) => {
    setVal(str);
    onChange?.(str);
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
      value={val}
      placeholder={placeholder}
      readOnly
      onKeyDown={keyDownHandler}
      style={{ width: 280, padding: 8 }}
    />
  );
};
