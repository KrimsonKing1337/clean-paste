import { useNavigate } from 'react-router';

import { RadioButton } from 'components/RadioButton';

import { doublePressOptions } from './utils.ts';

import styles from './Config.module.scss';

export const Config = () => {
  const navigate = useNavigate();

  const clickHandler = () => {
    navigate('/');
  };

  return (
    <div className={styles.Wrapper}>
      Config

      <div className={styles.BackButton} onClick={clickHandler}>
        Go back to Main
      </div>

      Choose double press hotkey:

      <div className={styles.RadioButtonsWrapper}>
        {doublePressOptions.map((optionCur) => {
          const { label, isDefault } = optionCur;

          return (
            <RadioButton name="doublePress" isDefault={isDefault} className={styles.RadioButton}>
              {label}
            </RadioButton>
          );
        })}
      </div>

      Make your shortcut (default is Ctrl + Shift + V):

      <input placeholder="Start to make shortcut" value="Ctrl + Shift + V" />
    </div>
  );
};
