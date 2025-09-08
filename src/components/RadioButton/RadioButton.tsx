import type { PropsWithChildren } from 'react';

import classNames from 'classnames';

import styles from './RadioButton.module.scss';

export type RadioButtonProps = PropsWithChildren & {
  children: string;
  className?: string;
  id?: string;
  name: string;
  isDefault?: boolean;

  onChange?: () => void;
};

export const RadioButton = ({
  children,
  className = '',
  id,
  name,
  isDefault = false,

  onChange = () => {}
  }: RadioButtonProps) => {
  const idValue = id ? id : children;

  const wrapperClassNames = classNames({
    [styles.Wrapper]: true,
    [className]: !!className,
  });

  return (
    <div className={wrapperClassNames}>
      <input
        id={idValue}
        name={name}
        type="radio"
        defaultChecked={isDefault}
        className={styles.Input}

        onChange={onChange}
      />

      <label htmlFor={idValue} className={styles.Label}>
        {children}
      </label>
    </div>
  );
};
