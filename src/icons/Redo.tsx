import type { SVGProps } from 'react';
import React from 'react';
const SvgRedo = (props: SVGProps<SVGSVGElement>) => (
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
      d="M8.158 8.309h5.838V7.297a.11.11 0 0 1 .176-.086l1.942 1.531a.11.11 0 0 1 0 .172l-1.942 1.532a.11.11 0 0 1-.176-.087V9.348H8.322v6.425h8.285c.06 0 .11.05.11.11v.82c0 .06-.05.11-.11.11H8.158a.876.876 0 0 1-.875-.875V9.184c0-.483.393-.875.875-.875Z"
    />
  </svg>
);
export default SvgRedo;
