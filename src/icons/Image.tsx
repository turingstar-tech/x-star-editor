import type { SVGProps } from 'react';
import React from 'react';
const SvgImage = (props: SVGProps<SVGSVGElement>) => (
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
      d="M17.688 7.188H6.313a.437.437 0 0 0-.438.437v8.75c0 .242.196.438.438.438h11.375a.437.437 0 0 0 .437-.438v-8.75a.437.437 0 0 0-.438-.438Zm-.547 8.64H6.859v-.545l1.894-2.247 2.052 2.434 3.192-3.784 3.144 3.726v.416Zm0-1.774-3.06-3.629a.109.109 0 0 0-.167 0l-3.109 3.686-1.969-2.334a.109.109 0 0 0-.166 0l-1.81 2.147V8.172h10.28v5.882Zm-7.985-2.82a1.203 1.203 0 1 0 0-2.406 1.203 1.203 0 0 0 0 2.406Zm0-1.586a.382.382 0 1 1 .002.765.382.382 0 0 1-.002-.765Z"
    />
  </svg>
);
export default SvgImage;
