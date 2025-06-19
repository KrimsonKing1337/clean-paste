import type { PropsWithChildren } from 'react';

export type LinkProps = PropsWithChildren & {
  href: string;
}

export const Link = ({ children, href }: LinkProps) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};
