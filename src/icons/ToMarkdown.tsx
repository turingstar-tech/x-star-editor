import type { SVGProps } from 'react';
import React from 'react';
const SvgToMarkdown = (props: SVGProps<SVGSVGElement>) => (
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
      d="m16.684 8.946-2.942-2.942a.437.437 0 0 0-.31-.129H7.626a.437.437 0 0 0-.438.438v11.375c0 .241.196.437.438.437h8.75a.437.437 0 0 0 .438-.438v-8.43a.44.44 0 0 0-.129-.311Zm-.88.511H13.23V6.884l2.574 2.573Zm.024 7.684H8.172V6.859H12.3v2.954c0 .317.257.574.574.574h2.953v6.754Zm-4.963-5.562a.163.163 0 0 0-.15-.099h-.479a.165.165 0 0 0-.164.165v3.718c0 .09.074.164.164.164h.37c.091 0 .165-.073.165-.164v-2.405l.913 2.054a.164.164 0 0 0 .15.097h.33a.167.167 0 0 0 .15-.097l.914-2.06v2.411c0 .09.074.164.164.164h.372c.09 0 .164-.073.164-.164v-3.718a.165.165 0 0 0-.164-.165h-.475a.163.163 0 0 0-.15.099l-1.136 2.611-1.138-2.611Z"
    />
  </svg>
);
export default SvgToMarkdown;
