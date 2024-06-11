import type { SVGProps } from 'react';
import React from 'react';
const SvgClear = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g fill="currentColor" fillRule="nonzero">
      <path d="M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6m1.938-1.393a5.06 5.06 0 0 0 2.668-2.667 4.97 4.97 0 0 0 0-3.88 5.06 5.06 0 0 0-2.668-2.666 4.97 4.97 0 0 0-3.876 0 5.06 5.06 0 0 0-2.668 2.667 4.97 4.97 0 0 0 0 3.879 5.06 5.06 0 0 0 2.668 2.667 4.97 4.97 0 0 0 3.876 0" />
      <path d="m9.251 14.027 4.776-4.776q.363-.362.725 0 .363.363 0 .725l-4.776 4.776q-.362.363-.725 0-.361-.362 0-.725" />
      <path d="M14.752 14.027 9.976 9.251q-.362-.362-.725 0-.361.363 0 .725l4.776 4.776q.363.363.725 0 .363-.362 0-.725" />
    </g>
  </svg>
);
export default SvgClear;
