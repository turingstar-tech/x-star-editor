import classNames from 'classnames';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { prefix } from '../utils/global';
import { composeHandlers } from '../utils/handler';
import type { HastRoot, ViewerOptions } from '../utils/markdown';
import {
  getDefaultSchema,
  postViewerRender,
  preViewerRender,
} from '../utils/markdown';

export interface XStarMdViewerPlugin {
  (ctx: ViewerOptions): void;
}

export interface XStarMdViewerHandle {
  getContainer: () => HTMLDivElement | null;
}

export interface XStarMdViewerProps {
  /**
   * CSS 类名
   */
  className?: string;

  /**
   * CSS 样式
   */
  style?: React.CSSProperties;

  /**
   * 文本
   */
  value?: string;

  /**
   * 插件
   */
  plugins?: XStarMdViewerPlugin[];
}

const XStarMdViewer = React.forwardRef<XStarMdViewerHandle, XStarMdViewerProps>(
  ({ className, style, value = '', plugins }, ref) => {
    const container = useRef<HTMLDivElement>(null);

    useImperativeHandle(
      ref,
      () => ({ getContainer: () => container.current }),
      [],
    );

    const options = composeHandlers(plugins)({
      customSchema: getDefaultSchema(),
      customHTMLElements: {},
      customBlocks: {},
    });
    const optionsLatest = useRef(options);
    optionsLatest.current = options;

    const [children, setChildren] = useState<JSX.Element>();

    const worker = useRef<Worker>();

    useEffect(() => {
      worker.current = new Worker(
        new URL('../workers/markdown.worker.js', import.meta.url),
      );
      worker.current.addEventListener('message', (e: MessageEvent<HastRoot>) =>
        setChildren(postViewerRender(e.data, optionsLatest.current)),
      );
      return () => worker.current?.terminate();
    }, []);

    useEffect(() => {
      worker.current?.postMessage([
        preViewerRender(value),
        optionsLatest.current.customSchema,
      ]);
    }, [value, plugins]);

    return (
      <div
        ref={container}
        className={classNames(`${prefix}md-viewer`, className)}
        style={style}
      >
        {children}
      </div>
    );
  },
);

if (process.env.NODE_ENV !== 'production') {
  XStarMdViewer.displayName = 'XStarMdViewer';
}

export default XStarMdViewer;

export const useMdViewerRef = () => useRef<XStarMdViewerHandle>(null);
