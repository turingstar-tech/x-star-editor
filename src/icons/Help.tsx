import type { SVGProps } from 'react';
import React from 'react';
const SvgHelp = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g fill="none" fillRule="evenodd" transform="translate(5 5)">
      <rect width={10} height={10} x={2} y={2} stroke="currentColor" rx={1} />
      <path
        fill="currentColor"
        fillRule="nonzero"
        d="M8.526 4.33A2.305 2.305 0 0 0 7 3.773c-.574 0-1.116.199-1.526.557a1.864 1.864 0 0 0-.662 1.412v.104c0 .06.05.11.11.11h.656c.06 0 .11-.05.11-.11v-.104c0-.603.589-1.094 1.312-1.094.723 0 1.313.491 1.313 1.094 0 .425-.301.815-.767.994a1.528 1.528 0 0 0-.985 1.447v.294c0 .06.05.109.11.109h.656c.06 0 .11-.05.11-.11v-.31c0-.27.169-.515.422-.612.806-.31 1.327-1.022 1.327-1.812a1.858 1.858 0 0 0-.66-1.412Zm-2.073 5.678a.547.547 0 1 0 1.094 0 .547.547 0 0 0-1.094 0Z"
      />
    </g>
  </svg>
);
export default SvgHelp;
