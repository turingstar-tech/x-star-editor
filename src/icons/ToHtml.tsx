import type { SVGProps } from 'react';
import React from 'react';
const SvgToHtml = (props: SVGProps<SVGSVGElement>) => (
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
      d="m16.684 8.946-2.942-2.942a.437.437 0 0 0-.31-.129H7.626a.437.437 0 0 0-.438.438v11.375c0 .241.196.437.438.437h8.75a.437.437 0 0 0 .438-.438v-8.43a.44.44 0 0 0-.129-.311Zm-.88.511H13.23V6.884l2.574 2.573ZM12.3 6.859v2.954c0 .317.257.574.574.574h2.953v6.754H8.172V6.859H12.3ZM10.99 11.5h-.3a.2.2 0 0 0-.2.2v3.6c0 .11.09.2.2.2h.3a.2.2 0 0 0 .2-.2v-1.452l.01.002h1.6a.2.2 0 0 0 .1-.027V15.3c0 .11.09.2.2.2h.3a.2.2 0 0 0 .2-.2v-3.6a.2.2 0 0 0-.2-.2h-.3a.2.2 0 0 0-.2.2v1.477a.2.2 0 0 0-.1-.027h-1.61V11.7a.2.2 0 0 0-.2-.2Z"
    />
  </svg>
);
export default SvgToHtml;
