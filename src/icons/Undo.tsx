import type { SVGProps } from 'react';
import React from 'react';
const SvgUndo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="nonzero"
      d="M15.842 8.309h-5.838V7.297a.11.11 0 0 0-.176-.086L7.886 8.742a.11.11 0 0 0 0 .172l1.942 1.532a.11.11 0 0 0 .176-.087V9.348h5.674v6.425H7.393a.11.11 0 0 0-.11.11v.82c0 .06.05.11.11.11h8.449a.876.876 0 0 0 .875-.875V9.184a.876.876 0 0 0-.875-.875Z"
    />
  </svg>
);
export default SvgUndo;
