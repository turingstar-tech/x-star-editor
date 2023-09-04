import type { SVGProps } from 'react';
import React from 'react';
const SvgUnorderedList = (props: SVGProps<SVGSVGElement>) => (
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
      d="M17.469 7.625H9.484a.11.11 0 0 0-.109.11V8.5c0 .06.05.11.11.11h7.984c.06 0 .11-.05.11-.11v-.766a.11.11 0 0 0-.11-.109Zm0 3.883H9.484a.11.11 0 0 0-.109.11v.765c0 .06.05.11.11.11h7.984c.06 0 .11-.05.11-.11v-.766a.11.11 0 0 0-.11-.11Zm0 3.883H9.484a.11.11 0 0 0-.109.109v.766c0 .06.05.109.11.109h7.984c.06 0 .11-.05.11-.11V15.5a.11.11 0 0 0-.11-.11ZM6.422 8.117a.766.766 0 1 0 1.531 0 .766.766 0 0 0-1.531 0Zm0 3.883a.766.766 0 1 0 1.531 0 .766.766 0 0 0-1.531 0Zm0 3.883a.766.766 0 1 0 1.531 0 .766.766 0 0 0-1.531 0Z"
    />
  </svg>
);
export default SvgUnorderedList;
