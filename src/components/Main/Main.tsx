import { useNavigate } from 'react-router';

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
      <Notes />

      <div onClick={clickHandler}>
        Go to Config
      </div>

      <Footer />
    </div>
  );
};
