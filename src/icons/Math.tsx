import type { SVGProps } from 'react';
import React from 'react';
const SvgMath = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M15.7 7a.1.1 0 0 1 .074.033.2.2 0 0 1 .077.093l.891 2.242a.1.1 0 0 1-.093.137h-.784a.1.1 0 0 1-.093-.063l-.575-1.443H8.708l3.867 3.865a.2.2 0 0 1 .038.23l-.038.053-.566.565-3.284 3.282H15.2l.572-1.436a.1.1 0 0 1 .054-.055l.039-.008h.784a.1.1 0 0 1 .093.137l-.891 2.242a.2.2 0 0 1-.186.126H14.8l-7.3-.006a.2.2 0 0 1-.2-.2v-.8h.01l3.992-3.989-4.002-4V7.2c0-.11.09-.2.2-.2h8.2Z"
    />
  </svg>
);
export default SvgMath;
