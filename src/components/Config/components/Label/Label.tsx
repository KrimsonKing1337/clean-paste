import type { PropsWithChildren } from 'react';

import styles from './Label.module.scss';

export const Label = ({ children }: PropsWithChildren) => {
  return (
    <div className={styles.Label}>
      {children}
    </div>
  );
};
