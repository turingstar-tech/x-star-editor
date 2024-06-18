import type { SVGProps } from 'react';
import React from 'react';
const SvgEraser = (props: SVGProps<SVGSVGElement>) => (
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
      d="M12.48 15.017 17 10.525 13.453 7.25l-4.378 4.363zm-.715.71-3.404-3.403-1.29 1.287a.247.247 0 0 0 .003.351l2.834 2.788h.829zm.443 1.023h5.291a.499.499 0 1 1 0 1H9.765a.5.5 0 0 1-.361-.157L6.272 14.47a1.015 1.015 0 0 1 .023-1.407l6.498-6.521a.99.99 0 0 1 1.403 0l3.513 3.278a1 1 0 0 1 0 1.41z"
    />
  </svg>
);
export default SvgEraser;
