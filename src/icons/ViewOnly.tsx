import type { SVGProps } from 'react';
import React from 'react';
const SvgViewOnly = (props: SVGProps<SVGSVGElement>) => (
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
      d="M8.008 6.531h-.916c-.05 0-.092.05-.092.11v10.718c0 .06.041.11.092.11h.916c.05 0 .092-.05.092-.11V6.641c0-.06-.041-.11-.092-.11Zm1.859 0a.458.458 0 0 0-.46.456v10.025c0 .252.205.455.46.455h6.679c.254 0 .46-.203.46-.455V6.987a.458.458 0 0 0-.46-.456h-6.68Zm6.135 9.959h-5.6v-9h5.6v9Z"
    />
  </svg>
);
export default SvgViewOnly;
