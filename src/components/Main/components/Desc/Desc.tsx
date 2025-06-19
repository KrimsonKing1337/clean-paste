import type { PropsWithChildren } from 'react';

import styles from './Desc.module.scss';

export const Desc = ({ children }: PropsWithChildren) => {
  return (
    <div className={styles.Desc}>
      {children}
    </div>
  );
};
