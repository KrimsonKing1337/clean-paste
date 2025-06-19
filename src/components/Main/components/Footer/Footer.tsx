import { SubTitle, Desc } from '../';

import styles from './Footer.module.scss';

export const Footer = () => {
  return (
    <div className={styles.Footer}>
      <SubTitle>
        Created by:
      </SubTitle>

      <Desc>
        <a href="https://github.com/KrimsonKing1337/clean-paste">
          KrimsonKing_1337
        </a>
      </Desc>
    </div>
  );
};
