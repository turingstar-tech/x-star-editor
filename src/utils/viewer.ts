import { useEffect, useMemo, useRef, useState } from 'react';
import workerRaw from '../../workers-dist/markdown.worker.js';
import type { ViewerOptions } from '../x-star-md-viewer';
import { postViewerRender, preViewerRender } from './markdown';

let sequence = 0;
let worker: Worker;

/**
 * 将 Markdown 文本映射到 React 虚拟 DOM 树
 *
 * @param sourceCode Markdown 文本
 * @param options 配置项
 * @returns React 虚拟 DOM 树
 */
export const useViewerRender = (sourceCode: string, options: ViewerOptions) => {
  const optionsLatest = useRef(options);
  optionsLatest.current = options;

  const [children, setChildren] = useState<React.JSX.Element>();

  const id = useMemo(
    () => `${Date.now()}-${(sequence = (sequence + 1) & 0xfff)}`,
    [],
  );

  useEffect(() => {
    if (!worker) {
      worker = new Worker(
        URL.createObjectURL(new Blob([workerRaw], { type: 'text/javascript' })),
      );
    }

    const listener = ({ data }: MessageEvent) => {
      if (data.id === id) {
        setChildren(postViewerRender(data.root, optionsLatest.current));
      }
    };

    worker.addEventListener('message', listener);
    return () => worker.removeEventListener('message', listener);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      async () =>
        worker.postMessage({
          id,
          root: await preViewerRender(sourceCode),
          schema: options.customSchema,
        }),
      100,
    );
    return () => window.clearTimeout(timer);
  }, [sourceCode, options]);

  return children;
};
