import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAsyncEffect } from 'use-async-effect';

import classNames from 'classnames';

import CrossIcon from 'assets/icons/i-cross.svg?react';

import { RadioButton, SubTitle } from 'components';

import { saveSettings, loadSettings, getCmdOrCtrl, Settings } from 'utils';

import { HotkeyInput, Label } from './components';

import { doublePressOptions, getCheckedDoubleHotkey, registerNewShortcut } from './utils';

import styles from './Config.module.scss';

let timer: ReturnType<typeof setTimeout>;

export const Config = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<Settings>({});
  const [savedLabelIsActive, setSavedLabelIsActive] = useState(false);

  useAsyncEffect(async () => {
    const settingsCurrent = await loadSettings();

    setSettings(settingsCurrent);
  }, []);

  const radioButtonChangeHandler = async (value: string) => {
    const newValue = {
      ...settings,
      doubleHotkey: value,
    };

    setSettings(newValue);
  };

  const inputChangeHandler = async (value: string) => {
    const newValue = {
      ...settings,
      hotkey: value,
    };

    setSettings(newValue);
  };

  const backButtonClickHandler = () => {
    navigate('/');
  };

  const saveButtonClickHandler = async () => {
    await registerNewShortcut(settings.hotkey as string, settings.doubleHotkey as string);
    await saveSettings(settings);

    setSavedLabelIsActive(true);

    if (timer) {
      clearInterval(timer);
    }

    timer = setTimeout(() => {
      setSavedLabelIsActive(false);
    }, 2500);
  }

  const defaultDoubleHotkey = getCmdOrCtrl();

  const savedButtonClassNames = classNames({
    [styles.SavedLabel]: true,
    [styles.isActive]: savedLabelIsActive,
  });

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

      <div className={styles.SaveButtonWrapper}>
        <div className={savedButtonClassNames}>
          Saved
        </div>

        <button className={styles.SaveButton} onClick={saveButtonClickHandler}>
          Save changes
        </button>
      </div>
    </div>
  );
};
