import type { SVGProps } from 'react';
import React from 'react';
const SvgPencil = (props: SVGProps<SVGSVGElement>) => (
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
      d="M13.263 6.98a1.977 1.977 0 0 1 2.796 0l.87.868a1.977 1.977 0 0 1 0 2.797l-.93.928-5.788 5.79a.5.5 0 0 1-.368.144l-2.862-.104a.494.494 0 0 1-.476-.476L6.4 14.065a.5.5 0 0 1 .145-.367l5.79-5.79.004-.004zm-.58 1.977-5.287 5.287.08 2.187 2.187.08 5.287-5.288zm2.677-1.278a.99.99 0 0 0-1.397 0l-.58.578 2.267 2.267.579-.579a.99.99 0 0 0 .058-1.335l-.058-.062z"
    />
  </svg>
);
export default SvgPencil;
