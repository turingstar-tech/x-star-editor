import classNames from 'classnames';
import type { Components } from 'hast-util-to-jsx-runtime';
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import workerRaw from '../../workers-dist/markdown.worker.js';
import { prefix } from '../utils/global';
import { composeHandlers } from '../utils/handler';
import type { Schema } from '../utils/markdown';
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
  getViewerContainer: () => HTMLDivElement;
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
   * 查看器的高度
   */
  height?: React.CSSProperties['height'];

  /**
   * 内置主题
   */
  theme?: string;

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
  (
    { className, style, height, theme, value = '', plugins, enableWebWorker },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(
      ref,
      () => ({ getViewerContainer: () => containerRef.current! }),
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

    const [children, setChildren] = useState<React.JSX.Element>();

    const worker = useRef<Worker>();

    useEffect(() => {
      if (enableWebWorker) {
        worker.current = new Worker(
          URL.createObjectURL(
            new Blob([workerRaw], { type: 'text/javascript' }),
          ),
        );
        worker.current.addEventListener('message', ({ data }) =>
          setChildren(postViewerRender(data, optionsLatest.current)),
        );
        return () => worker.current?.terminate();
      }
    }, [enableWebWorker]);

    useEffect(() => {
      const timer = window.setTimeout(async () => {
        const root = await preViewerRender(value);
        if (enableWebWorker) {
          worker.current?.postMessage([root, options.customSchema]);
        } else {
          setChildren(
            postViewerRender(viewerRender(root, options.customSchema), options),
          );
        }
      }, 100);
      return () => window.clearTimeout(timer);
    }, [value, options]);

    // 确保在末尾输入时能同步滚动
    useEffect(() => {
      const timer = window.setTimeout(
        () => containerRef.current?.dispatchEvent(new Event('render')),
        100,
      );
      return () => window.clearTimeout(timer);
    }, [children]);

    return (
      <div
        ref={containerRef}
        className={classNames(
          `${prefix}md-viewer`,
          { [`${prefix}theme-${theme}`]: theme },
          className,
        )}
        style={{ ...style, height }}
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
