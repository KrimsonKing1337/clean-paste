import { invoke } from '@tauri-apps/api/core';

import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAsyncEffect } from 'use-async-effect';

import CrossIcon from 'assets/icons/i-cross.svg?react';

import { RadioButton, SubTitle } from 'components';

import { HotkeyInput, Label } from './components';

import { doublePressOptions } from './utils.ts';

import styles from './Config.module.scss';

type Settings = {
  hotkey?: string;
  radioHotkey?: string;
}

export const Config = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<Settings>({});

  useAsyncEffect(async () => {
    const settingsCurrentJson = await invoke('load_settings') as unknown as string;
    const settingsCurrent = JSON.parse(settingsCurrentJson);

    setSettings(settingsCurrent);
  }, []);

  const radioButtonChangeHandler = async (value: string) => {
    const settingsNewValue = {
      ...settings,
      radioHotkey: value,
    };

    const settingsJson = JSON.stringify(settingsNewValue);

    await invoke('save_settings', { content: settingsJson });

    setSettings(settingsNewValue);
  };

  const inputChangeHandler = async (value: string) => {
    const settingsNewValue = {
      ...settings,
      hotkey: value,
    };

    const settingsJson = JSON.stringify(settingsNewValue);

    await invoke('save_settings', { content: settingsJson });

    setSettings(settingsNewValue);
  };

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
          // todo: isDefault определяется плагином. и задаётся только если значения в settings нет
          const { label, isDefault } = optionCur;

          return (
            <RadioButton
              key={label}
              name="doublePress"
              isDefault={isDefault}
              className={styles.RadioButton}
              onChange={() => radioButtonChangeHandler(label)}
            >
              {label}
            </RadioButton>
          );
        })}
      </div>

      <Label>
        Set your hotkey (default is Ctrl/Cmd + Shift + V):
      </Label>

      <HotkeyInput value={settings.hotkey} onChange={inputChangeHandler} />
    </div>
  );
};
