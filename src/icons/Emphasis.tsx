import type { SVGProps } from 'react';
import React from 'react';
const SvgEmphasis = (props: SVGProps<SVGSVGElement>) => (
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
      d="M15.91 7.188h-5.906a.11.11 0 0 0-.11.109v.875c0 .06.05.11.11.11h2.477l-2.133 7.437H8.131a.11.11 0 0 0-.11.11v.874c0 .06.05.11.11.11h5.906c.06 0 .11-.05.11-.11v-.875a.11.11 0 0 0-.11-.11h-2.551l2.133-7.437h2.291c.06 0 .11-.049.11-.11v-.874a.11.11 0 0 0-.11-.11Z"
    />
  </svg>
);
export default SvgEmphasis;
