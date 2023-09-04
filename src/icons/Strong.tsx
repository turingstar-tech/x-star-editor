import type { SVGProps } from 'react';
import React from 'react';
const SvgStrong = (props: SVGProps<SVGSVGElement>) => (
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
      d="M14.5 11.553a2.627 2.627 0 0 0 .737-1.825V9.59c0-1.462-1.197-2.649-2.672-2.649h-4.02a.373.373 0 0 0-.373.373v9.227c0 .221.18.4.4.4h4.33c1.59 0 2.879-1.28 2.879-2.86v-.15c0-.991-.509-1.865-1.28-2.378ZM9.477 8.246h3.053c.776 0 1.404.603 1.404 1.349v.129c0 .745-.63 1.35-1.404 1.35H9.476V8.245Zm4.981 5.834c0 .855-.702 1.548-1.57 1.548h-3.41v-3.242h3.41c.868 0 1.57.693 1.57 1.547v.147Z"
    />
  </svg>
);
export default SvgStrong;
