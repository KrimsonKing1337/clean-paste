import { useNavigate } from 'react-router';

import ConfigIcon from 'assets/icons/i-config.svg?react';

import {
  Header,
  Shortcuts,
  Notes,
  Footer,
} from './components';

import styles from './Main.module.scss';

export const Main = () => {
  const navigate = useNavigate();

  const clickHandler = () => {
    navigate('/config');
  };

  return (
    <div className={styles.Main}>
      <Header />
      <Shortcuts />

      <div className={styles.ConfigIconWrapper} onClick={clickHandler}>
        <ConfigIcon />
      </div>

      <Notes />
      <Footer />
    </div>
  );
};
