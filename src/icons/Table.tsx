import type { SVGProps } from 'react';
import React from 'react';
const SvgTable = (props: SVGProps<SVGSVGElement>) => (
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
      d="M17.013 9.594H6.987a.446.446 0 0 0-.456.437v6.344c0 .242.204.438.456.438h10.025a.446.446 0 0 0 .455-.438v-6.344a.444.444 0 0 0-.454-.437Zm-7.091 6.234H7.516v-2.187h2.406v2.187Zm0-3.062H7.516v-2.188h2.406v2.188Zm3.281 3.062h-2.406v-2.187h2.406v2.187Zm0-3.062h-2.406v-2.188h2.406v2.188Zm3.281 3.062h-2.406v-2.187h2.406v2.187Zm0-3.062h-2.406v-2.188h2.406v2.188Zm.875-5.579H6.641a.11.11 0 0 0-.11.11V8.39c0 .06.05.109.11.109h10.718c.06 0 .11-.05.11-.11V7.298a.11.11 0 0 0-.11-.11Z"
    />
  </svg>
);
export default SvgTable;
