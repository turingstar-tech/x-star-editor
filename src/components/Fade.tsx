import React, { useEffect, useRef, useState } from 'react';

interface FadeProps {
  children: React.ReactNode;
  className: string;
  appear: boolean;
  timeout: number;
}

const Fade = React.forwardRef<HTMLDivElement, FadeProps>(
  ({ children, className, appear, timeout }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const composedRef = (instance: HTMLDivElement | null) => {
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
      containerRef.current = instance;
    };

    const [mount, setMount] = useState(appear);

    useEffect(() => {
      if (appear) {
        if (containerRef.current) {
          // 强制浏览器进行重排，保证淡入效果
          containerRef.current.getBoundingClientRect();
          containerRef.current.style.opacity = '1';
        }
        setMount(true);
      } else {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0';
        }
        const timer = window.setTimeout(() => setMount(false), timeout);
        return () => window.clearTimeout(timer);
      }
    }, [appear]);

    return (
      (appear || mount) && (
        <div ref={composedRef} className={className}>
          {children}
        </div>
      )
    );
  },
);

export default Fade;
