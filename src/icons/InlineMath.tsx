import type { SVGProps } from 'react';
import React from 'react';
const SvgInlineMath = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g fill="currentColor" fillRule="evenodd" transform="translate(5 5)">
      <rect width={10} height={1} x={2} y={3} rx={0.1} />
      <path d="M4 4h1v6.9a.1.1 0 0 1-.1.1h-.8a.1.1 0 0 1-.1-.1V4ZM9 4h1v7h-.5a.5.5 0 0 1-.5-.5V4Z" />
      <path d="M9 10h3.4a.1.1 0 0 1 .1.1v.8a.1.1 0 0 1-.1.1H9.5a.5.5 0 0 1-.5-.5V10Z" />
    </g>
  </svg>
);
export default SvgInlineMath;
