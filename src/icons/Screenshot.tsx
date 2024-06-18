import type { SVGProps } from 'react';
import React from 'react';
const SvgScreenshot = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g fill="currentColor" fillRule="nonzero">
      <path d="M7.5 14.2V16a.5.5 0 0 0 .5.5h1.8c.11 0 .2.09.2.2v.6a.2.2 0 0 1-.2.2H8a1.5 1.5 0 0 1-1.493-1.356l-.007-.14V14.2c0-.11.09-.2.2-.2h.6c.11 0 .2.09.2.2m10 0V16a1.5 1.5 0 0 1-1.5 1.5h-1.8a.2.2 0 0 1-.2-.2v-.6c0-.11.09-.2.2-.2H16a.5.5 0 0 0 .492-.41l.007-.081.001-.018V14.2c0-.11.09-.2.2-.2h.6c.11 0 .2.09.2.2M16 6.5A1.5 1.5 0 0 1 17.5 8v1.8a.2.2 0 0 1-.2.2h-.6a.2.2 0 0 1-.2-.2V8a.5.5 0 0 0-.41-.492l-.081-.007-.018-.001H14.2a.2.2 0 0 1-.2-.2v-.6c0-.11.09-.2.2-.2zm-6 .2v.6a.2.2 0 0 1-.2.2H8a.5.5 0 0 0-.492.41l-.007.081-.001.018V9.8a.2.2 0 0 1-.2.2h-.6a.2.2 0 0 1-.2-.2V8a1.5 1.5 0 0 1 1.356-1.493l.14-.007H9.8c.11 0 .2.09.2.2M10.891 12.216a1.108 1.108 0 1 0 2.217 0 1.108 1.108 0 0 0-2.217 0" />
      <path d="M14.557 10.08h-.868a.37.37 0 0 1-.322-.175l-.202-.286a.38.38 0 0 0-.316-.169h-1.78a.4.4 0 0 0-.323.169l-.196.286a.39.39 0 0 1-.322.175H9.45a.57.57 0 0 0-.575.567v3.238c0 .316.26.567.575.567h5.11a.564.564 0 0 0 .566-.567v-3.238a.567.567 0 0 0-.569-.567M12 13.788c-.862 0-1.57-.701-1.57-1.57a1.572 1.572 0 0 1 3.146 0c0 .869-.708 1.57-1.576 1.57" />
    </g>
  </svg>
);
export default SvgScreenshot;
