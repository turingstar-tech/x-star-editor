import type { Fragment, Jsx } from 'hast-util-to-jsx-runtime';

declare module 'react/jsx-runtime' {
  export const Fragment: Fragment;
  export const jsx: Jsx;
  export const jsxs: Jsx;
}
