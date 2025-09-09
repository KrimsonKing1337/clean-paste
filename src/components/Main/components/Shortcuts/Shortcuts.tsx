import { useState } from 'react';

import { useAsyncEffect } from 'use-async-effect';

import { SubTitle } from 'components';

import { type Settings, loadSettings } from 'utils';

import { Desc } from '../';

import { getLabelForShortcuts } from './utils.ts';

import styles from './Shortcuts.module.scss';

export const Shortcuts = () => {
  const [settings, setSettings] = useState<Settings>({});

  useAsyncEffect(async () => {
    const settingsCurrent = await loadSettings();

    setSettings(settingsCurrent);
  }, []);

  const labelForShortcuts = getLabelForShortcuts(settings);

  return (
    <div className={styles.Shortcuts}>
      <SubTitle>
        Hotkeys:
      </SubTitle>

      <Desc>
        {labelForShortcuts}
      </Desc>
    </div>
  );
};
