import type { PropsWithChildren } from 'react';

import styles from './SubTitle.module.scss';

export type SummaryProps = PropsWithChildren & {
  className?: string;
};

export const SubTitle = ({ children, className }: SummaryProps) => {
  const subtitleClassNames = `${styles.SubTitle} ${className}`;

  return (
    <div className={subtitleClassNames}>
      {children}
    </div>
  );
};
