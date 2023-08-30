import classNames from 'classnames';
import type { Components } from 'hast-util-to-jsx-runtime';
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { prefix } from '../utils/global';
import { composeHandlers } from '../utils/handler';
import type { HastRoot, Schema } from '../utils/markdown';
import {
  getDefaultSchema,
  postViewerRender,
  preViewerRender,
  viewerRender,
} from '../utils/markdown';

export interface ViewerOptions {
  /**
   * 自定义过滤模式
   */
  customSchema: Schema;

  /**
   * 自定义 HTML 元素
   */
  customHTMLElements: Partial<Components>;

  /**
   * 自定义块
   */
  customBlocks: Partial<
    Record<string, React.ComponentType<{ children: string }>>
  >;
}

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

  /**
   * 是否启用 Web Worker
   */
  enableWebWorker?: boolean;
}

const XStarMdViewer = React.forwardRef<XStarMdViewerHandle, XStarMdViewerProps>(
  ({ className, style, value = '', plugins, enableWebWorker }, ref) => {
    const container = useRef<HTMLDivElement>(null);

    useImperativeHandle(
      ref,
      () => ({ getContainer: () => container.current }),
      [],
    );

    const options = useMemo(
      () =>
        composeHandlers(plugins)({
          customSchema: getDefaultSchema(),
          customHTMLElements: {},
          customBlocks: {},
        }),
      [plugins],
    );

    const optionsLatest = useRef(options);
    optionsLatest.current = options;

    const [children, setChildren] = useState<JSX.Element>();

    const worker = useRef<Worker>();

    useEffect(() => {
      if (enableWebWorker) {
        worker.current = new Worker(
          new URL('../../workers/markdown.worker.js', import.meta.url),
        );
        worker.current.addEventListener(
          'message',
          ({ data }: MessageEvent<HastRoot>) =>
            setChildren(postViewerRender(data, optionsLatest.current)),
        );
        return () => worker.current?.terminate();
      }
    }, [enableWebWorker]);

    useEffect(() => {
      const params = [preViewerRender(value), options.customSchema] as const;
      if (enableWebWorker) {
        worker.current?.postMessage(params);
      } else {
        setChildren(postViewerRender(viewerRender(...params), options));
      }
    }, [value, options]);

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
