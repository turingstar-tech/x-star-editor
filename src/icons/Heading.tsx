import type { SVGProps } from 'react';
import React from 'react';
const SvgHeading = (props: SVGProps<SVGSVGElement>) => (
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
      d="M9.524 7.331c.06 0 .11.08.11.179v4.208h4.9V7.51c0-.079.032-.146.075-.17l.035-.009h.88c.06 0 .11.08.11.179v9.643c0 .098-.05.178-.11.178h-.88c-.06 0-.11-.08-.11-.178v-4.335h-4.9v4.335c0 .078-.032.145-.075.17l-.035.008h-.88c-.06 0-.11-.08-.11-.178V7.51c0-.098.05-.179.11-.179Z"
    />
  </svg>
);
export default SvgHeading;
