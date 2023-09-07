import type { SVGProps } from 'react';
import React from 'react';
const SvgMermaid = (props: SVGProps<SVGSVGElement>) => (
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
      d="M16.936 13.576h-1.295v-1.894a.1.1 0 0 0-.1-.1h-3.09v-1.195h1.346a.2.2 0 0 0 .2-.2V6.6a.2.2 0 0 0-.2-.199h-3.588a.2.2 0 0 0-.2.2v3.587c0 .11.09.2.2.2h1.345v1.196h-3.09a.1.1 0 0 0-.099.1v1.893H7.069a.2.2 0 0 0-.199.2v3.587c0 .11.09.2.2.2h3.587a.2.2 0 0 0 .2-.2v-3.588a.2.2 0 0 0-.2-.199H9.262V12.48h5.482v1.096h-1.396a.2.2 0 0 0-.199.2v3.587c0 .11.09.2.2.2h3.587a.2.2 0 0 0 .2-.2v-3.588a.2.2 0 0 0-.2-.199Zm-7.026.947v2.093H7.817v-2.093H9.91Zm1.046-5.083V7.347h2.093V9.44h-2.093Zm5.233 7.176h-2.093v-2.093h2.093v2.093Z"
    />
  </svg>
);
export default SvgMermaid;
