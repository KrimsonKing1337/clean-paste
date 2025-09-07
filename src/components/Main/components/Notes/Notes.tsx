import { Accordion, Link, SubTitle } from 'components';

import { Desc } from '../';

import styles from './Notes.module.scss';

export const Notes = () => {
  const summary = (
    <SubTitle>
      It uses:
    </SubTitle>
  );

  return (
    <div className={styles.Notes}>
      <Accordion summary={summary}>
        <Desc>
          <Link href="https://www.gnu.org/licenses/gpl-3.0.ru.html">
            GPL 3.0 License
          </Link>

          <Link href="https://www.flaticon.com/free-icons/files-and-folders">
            Files and folders icons created by bearicons - Flaticon
          </Link>

          <Link href="https://www.flaticon.com/free-icons/settings">
            Settings icons created by Ilham Fitrotul Hayat - Flaticon
          </Link>
        </Desc>
      </Accordion>
    </div>
  );
};
