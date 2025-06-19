import {
  type ReactNode,
  type PropsWithChildren,

  useEffect,
  useRef, useState,
} from 'react';

export type AccordionProps = PropsWithChildren & {
  summary?: ReactNode;
};

import styles from './Accordion.module.scss';

export const Accordion = ({ summary = '', children }: AccordionProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const accordionElement = ref.current as HTMLDivElement;
    const contentElement = ref.current.querySelector(`.${styles.Content}`) as HTMLDivElement;

    if (!contentElement) {
      return;
    }

    const clickHandler = () => {
      if (!isOpened) {
        contentElement.style.maxHeight = contentElement.scrollHeight + 'px';

        setIsOpened(true);
      } else {
        contentElement.style.maxHeight = '';

        setIsOpened(false);
      }
    };

    accordionElement.addEventListener('click', clickHandler);

    return () => {
      accordionElement.removeEventListener('click', clickHandler);
    }
  }, [ref.current, isOpened]);

  const contentClassNameIsOpened = isOpened ? styles.isOpened : '';
  const contentClassNames = `${styles.Content} ${contentClassNameIsOpened}`;

  return (
    <div ref={ref} className={styles.Accordion}>
      <div className={styles.Summary}>
        {summary}
      </div>

      <div className={contentClassNames}>
        {children}
      </div>
    </div>
  );
};
