import icon from 'assets/icon.png';

import styles from './Header.module.scss';

export const Header = () => {
  return (
    <div className="Header">
      <img className={styles.Icon} src={icon} alt="" />

      <div className={styles.Title}>
        Simple text formatting remover app
      </div>
    </div>
  );
};
