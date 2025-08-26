import type { PropsWithChildren } from 'react';

import classNames from 'classnames';

import styles from './RadioButton.module.scss';

export type RadioButtonProps = PropsWithChildren & {
  children: string;
  className?: string;
  id?: string;
  name: string;
  isDefault?: boolean;
};

export const RadioButton = ({
  children,
  className = '',
  id,
  name,
  isDefault = false,
  }: RadioButtonProps) => {
  const idValue = id ? id : children;

  const wrapperClassNames = classNames({
    [styles.Wrapper]: true,
    [className]: !!className,
  });

  return (
    <div className={wrapperClassNames}>
      <input id={idValue} name={name} type="radio" defaultChecked={isDefault} className={styles.Input} />

      <label htmlFor={idValue} className={styles.Label}>
        {children}
      </label>
    </div>
  );
};
