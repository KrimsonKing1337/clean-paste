import {
  Header,
  Shortcuts,
  Notes,
  Footer,
} from './components';

import styles from './Main.module.scss';

export const Main = () => {
  return (
    <div className={styles.Main}>
      <Header />
      <Shortcuts />
      <Notes />
      <Footer />
    </div>
  );
};
