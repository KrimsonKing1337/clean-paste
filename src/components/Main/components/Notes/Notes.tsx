import { SubTitle, Desc } from '../';

import styles from './Notes.module.scss';

export const Notes = () => {
  return (
    <div className={styles.Notes}>
      <SubTitle>
        It uses:
      </SubTitle>

      <Desc>
        <a href="https://www.gnu.org/licenses/gpl-3.0.ru.html">
          GPL 3.0 License
        </a>

        <a href="https://www.flaticon.com/free-icons/files-and-folders">
          Files and folders icons created by bearicons - Flaticon
        </a>
      </Desc>
    </div>
  );
};
