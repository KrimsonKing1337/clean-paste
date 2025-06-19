import type { PropsWithChildren } from 'react';

import styles from './SubTitle.module.scss';

export const SubTitle = ({ children }: PropsWithChildren) => {
  return (
    <div className={styles.SubTitle}>
      {children}
    </div>
  );
};
