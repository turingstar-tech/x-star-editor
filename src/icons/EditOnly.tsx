import type { SVGProps } from 'react';
import React from 'react';
const SvgEditOnly = (props: SVGProps<SVGSVGElement>) => (
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
      d="M15.992 6.531h.916c.05 0 .092.05.092.11v10.718c0 .06-.041.11-.092.11h-.916c-.05 0-.092-.05-.092-.11V6.641c0-.06.041-.11.092-.11Zm-1.859 0c.255 0 .46.204.46.456v10.025a.458.458 0 0 1-.46.455H7.454a.458.458 0 0 1-.46-.455V6.987c0-.252.206-.456.46-.456h6.68ZM7.998 16.49h5.6v-9h-5.6v9Z"
    />
  </svg>
);
export default SvgEditOnly;
