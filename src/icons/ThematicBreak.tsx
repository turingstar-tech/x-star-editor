import type { SVGProps } from 'react';
import React from 'react';
const SvgThematicBreak = (props: SVGProps<SVGSVGElement>) => (
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
      d="M17.36 11.508H6.64a.11.11 0 0 0-.109.11v.765c0 .06.05.11.11.11h10.718c.06 0 .11-.05.11-.11v-.766a.11.11 0 0 0-.11-.11Z"
    />
  </svg>
);
export default SvgThematicBreak;
