import { SubTitle } from 'components';

import { Desc } from '../';

import styles from './Shortcuts.module.scss';

export const Shortcuts = () => {
  return (
    <div className={styles.Shortcuts}>
      <SubTitle>
        Default hotkeys:
      </SubTitle>

      <Desc>
        <span>
          Windows/Linux: Double Ctrl and Ctrl + Shift + V
        </span>

        <span>
          MacOS: Double Cmd and Cmd + Shift + V
        </span>
      </Desc>
    </div>
  );
};
