import { openUrl } from '@tauri-apps/plugin-opener';

import { SubTitle } from 'components';

import { Desc } from '../';

import styles from './Footer.module.scss';

export const Footer = () => {
  const clickHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    openUrl('https://github.com/KrimsonKing1337/clean-paste');
  };

  return (
    <div className={styles.Footer}>
      <SubTitle>
        Created by:
      </SubTitle>

      <Desc>
        <a href="" onClick={clickHandler}>
          KrimsonKing_1337
        </a>
      </Desc>
    </div>
  );
};
