import React, { useEffect, useState } from 'react';

interface FadeProps {
  children: React.ReactNode;
  nodeRef: React.RefObject<HTMLDivElement>;
  appear: boolean;
  timeout: number;
}

const Fade = ({ children, nodeRef, appear, timeout }: FadeProps) => {
  const [mount, setMount] = useState(appear);

  useEffect(() => {
    if (appear) {
      if (nodeRef.current) {
        nodeRef.current.getBoundingClientRect();
        nodeRef.current.style.opacity = '1';
      }
      setMount(true);
    } else {
      if (nodeRef.current) {
        nodeRef.current.style.opacity = '0';
      }
      const timer = window.setTimeout(() => setMount(false), timeout);
      return () => window.clearTimeout(timer);
    }
  }, [appear, timeout]);

  return <>{(appear || mount) && children}</>;
};

export default Fade;
