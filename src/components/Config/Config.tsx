import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAsyncEffect } from 'use-async-effect';

import CrossIcon from 'assets/icons/i-cross.svg?react';

import { RadioButton, SubTitle } from 'components';

import { saveSettings, loadSettings, getCmdOrCtrl } from 'utils';

import { HotkeyInput, Label } from './components';

import { doublePressOptions, getCheckedDoubleHotkey } from './utils';

import styles from './Config.module.scss';

type Settings = {
  hotkey?: string;
  radioHotkey?: string;
}

export const Config = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<Settings>({});

  useAsyncEffect(async () => {
    const settingsCurrent = await loadSettings();

    setSettings(settingsCurrent);
  }, []);

  const radioButtonChangeHandler = async (value: string) => {
    const settingsNewValue = await saveSettings({ radioHotkey: value });

    setSettings(settingsNewValue);
  };

  const inputChangeHandler = async (value: string) => {
    const settingsNewValue = await saveSettings({ hotkey: value });

    setSettings(settingsNewValue);
  };

  const clickHandler = () => {
    navigate('/');
  };

  const defaultDoubleHotkey = getCmdOrCtrl();

  return (
    <div className={styles.Wrapper}>
      <div className={styles.BackButton} onClick={clickHandler}>
        <CrossIcon />
      </div>

      <SubTitle className={styles.SubTitle}>
        Config
      </SubTitle>

      <Label>
        Set double press hotkey (default is {defaultDoubleHotkey}):
      </Label>

      <div className={styles.RadioButtonsWrapper}>
        {doublePressOptions.map((optionCur) => {
          const checkedValue = getCheckedDoubleHotkey(settings);

          const checked = checkedValue === optionCur;

          return (
            <RadioButton
              key={optionCur}
              name="doublePress"
              checked={checked}
              className={styles.RadioButton}
              onChange={() => radioButtonChangeHandler(optionCur)}
            >
              {optionCur}
            </RadioButton>
          );
        })}
      </div>

      <Label>
        Set your hotkey (default is {defaultDoubleHotkey} + Shift + V):
      </Label>

      <HotkeyInput value={settings.hotkey} onChange={inputChangeHandler} />
    </div>
  );
};
