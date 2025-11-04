import { invoke } from '@tauri-apps/api/core';

import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAsyncEffect } from 'use-async-effect';

import CrossIcon from 'assets/icons/i-cross.svg?react';

import { RadioButton, SubTitle } from 'components';

import { saveSettings, loadSettings, getCmdOrCtrl, Settings } from 'utils';

import { HotkeyInput, Label } from './components';

import { doublePressOptions, getCheckedDoubleHotkey } from './utils';

import styles from './Config.module.scss';

function sendToRust(hotkey: string, doubleHotkey: string) {
  return invoke('new_shortcut', {
    hotkey,
    doubleHotkey,
  });
}

export const Config = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<Settings>({});

  useAsyncEffect(async () => {
    const settingsCurrent = await loadSettings();

    setSettings(settingsCurrent);
  }, []);

  const radioButtonChangeHandler = async (value: string) => {
    const settingsNewValue = await saveSettings({ doubleHotkey: value });

    setSettings(settingsNewValue);
  };

  const inputChangeHandler = async (value: string) => {
    const settingsNewValue = await saveSettings({ hotkey: value });

    setSettings(settingsNewValue);
  };

  const backButtonClickHandler = () => {
    navigate('/');
  };

  const saveButtonClickHandler = async () => {
    await sendToRust(settings.hotkey as string, settings.doubleHotkey as string);
  }

  const defaultDoubleHotkey = getCmdOrCtrl();

  return (
    <div className={styles.Wrapper}>
      <div className={styles.BackButton} onClick={backButtonClickHandler}>
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
          const { label, value } = optionCur;

          const valueFromSettings = getCheckedDoubleHotkey(settings);

          const checked = valueFromSettings.value === value;

          return (
            <RadioButton
              key={value}
              name="doublePress"
              checked={checked}
              className={styles.RadioButton}
              onChange={() => radioButtonChangeHandler(value)}
            >
              {label}
            </RadioButton>
          );
        })}
      </div>

      <Label>
        Set your hotkey (default is {defaultDoubleHotkey} + Shift + V):
      </Label>

      <HotkeyInput value={settings.hotkey} onChange={inputChangeHandler} />

      <button className={styles.SaveButton} onClick={saveButtonClickHandler}>
        Save changes
      </button>
    </div>
  );
};
