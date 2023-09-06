import type { SVGProps } from 'react';
import React from 'react';
const SvgTaskList = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g fill="none" fillRule="evenodd">
      <path
        fill="currentColor"
        fillRule="nonzero"
        d="M17.869 7.625H9.884a.11.11 0 0 0-.109.11V8.5c0 .06.05.11.11.11h7.984c.06 0 .11-.05.11-.11v-.766a.11.11 0 0 0-.11-.109ZM17.869 11.508H9.884a.11.11 0 0 0-.109.11v.765c0 .06.05.11.11.11h7.984c.06 0 .11-.05.11-.11v-.766a.11.11 0 0 0-.11-.11ZM17.869 15.39H9.884a.11.11 0 0 0-.109.11v.766c0 .06.05.109.11.109h7.984c.06 0 .11-.05.11-.11V15.5a.11.11 0 0 0-.11-.11Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="round"
        strokeWidth={0.75}
        d="m6.4 8.25.75.75 1.5-1.5M6.4 11.75l.75.75 1.5-1.5M6.4 15.75l.75.75 1.5-1.5"
      />
    </g>
  </svg>
);
export default SvgTaskList;
