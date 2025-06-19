import { SubTitle, Desc } from '../';

import styles from './Shortcuts.module.scss';

export const Shortcuts = () => {
  return (
    <div className={styles.Shortcuts}>
      <SubTitle>
        Hotkeys:
      </SubTitle>

      <Desc>
        <span>
          Windows/Linux: Double Ctrl or Ctrl + Shift + V
        </span>

        <span>
          MacOS: Double Cmd or Cmd + Shift + V
        </span>
      </Desc>
    </div>
  );
};
