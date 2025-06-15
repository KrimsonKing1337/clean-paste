import icon from '@/assets/icon.png';

import styles from './App.module.scss';

export const App = () => {
  return (
    <div className={styles.Container}>
      <img className={styles.Icon} src={icon} alt="" />

      <div className={styles.Title}>
        Simple text formatting remover app
      </div>

      <div className={styles.Shortcuts}>
        <div className={styles.SubTitle}>
          Hotkeys:
        </div>

        <div className={styles.Desc}>
          <span>
            Windows/Linux: Double Ctrl or Ctrl + Shift + V
          </span>

          <span>
            MacOS: Double Cmd or Cmd + Shift + V
          </span>
        </div>
      </div>

      <div className={styles.Notes}>
        <div className={styles.SubTitle}>
          It uses:
        </div>

        <div className={styles.Desc}>
          <a href="https://www.gnu.org/licenses/gpl-3.0.ru.html">
            GPL 3.0 License
          </a>

          <a href="https://www.flaticon.com/free-icons/files-and-folders">
            Files and folders icons created by bearicons - Flaticon
          </a>
        </div>
      </div>

      <div className={styles.Footer}>
        <div className={styles.SubTitle}>
          Created by:
        </div>

        <div className={styles.Desc}>
          <a href="https://github.com/KrimsonKing1337/clean-paste">
            KrimsonKing_1337
          </a>
        </div>
      </div>
    </div>
  );
}
