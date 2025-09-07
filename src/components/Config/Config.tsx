import { useNavigate } from 'react-router';

import CrossIcon from 'assets/icons/i-cross.svg?react';

import { RadioButton, SubTitle } from 'components';

import { HotkeyInput, Label } from './components';

import { doublePressOptions } from './utils.ts';

import styles from './Config.module.scss';

export const Config = () => {
  const navigate = useNavigate();

  const clickHandler = () => {
    navigate('/');
  };

  return (
    <div className={styles.Wrapper}>
      <div className={styles.BackButton} onClick={clickHandler}>
        <CrossIcon />
      </div>

      <SubTitle className={styles.SubTitle}>
        Config
      </SubTitle>

      <Label>
        Set double press hotkey (default is Ctrl/Cmd):
      </Label>

      <div className={styles.RadioButtonsWrapper}>
        {doublePressOptions.map((optionCur) => {
          const { label, isDefault } = optionCur;

          return (
            <RadioButton name="doublePress" isDefault={isDefault} className={styles.RadioButton}>
              {label}
            </RadioButton>
          );
        })}
      </div>

      <Label>
        Set your hotkey (default is Ctrl/Cmd + Shift + V):
      </Label>

      <HotkeyInput />
    </div>
  );
};
