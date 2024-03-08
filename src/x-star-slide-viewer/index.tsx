import classNames from 'classnames';
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ViewerOptions } from 'x-star-editor/x-star-md-viewer/index.js';
import workerRaw from '../../workers-dist/markdown.worker.js';
import { prefix } from '../utils/global';
import { composeHandlers } from '../utils/handler';
import {
  getDefaultSchema,
  postViewerRender,
  preViewerRender,
} from '../utils/markdown';

let worker: Worker;

export interface XStarSlideViewerPlugin {
  (ctx: ViewerOptions): void;
}

export interface XStarSlideViewerHandle {
  getViewerContainer: () => HTMLDivElement;
}

export interface XStarSlideViewerProps {
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
  plugins?: XStarSlideViewerPlugin[];
}

const XStarSlideViewer = React.forwardRef<
  XStarSlideViewerHandle,
  XStarSlideViewerProps
>(({ className, style, height, theme, value = '', plugins }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({ getViewerContainer: () => containerRef.current! }),
    [],
  );

  const options = useMemo(
    () =>
      composeHandlers(plugins)({
        // 这里的 plugins 是一个数组，里面是一些函数
        customSchema: getDefaultSchema(),
        customHTMLElements: {},
        customBlocks: {},
      }),
    [plugins],
  );
  const optionsLatest = useRef(options);
  optionsLatest.current = options;

  const [children, setChildren] = useState<React.JSX.Element>();

  const id = useMemo(
    () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    [],
  );

  useEffect(() => {
    if (!worker) {
      worker = new Worker(
        URL.createObjectURL(new Blob([workerRaw], { type: 'text/javascript' })),
      );
    }

    const listener = ({ data }: MessageEvent) => {
      console.log('data', data);
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
          root: await preViewerRender(value),
          schema: options.customSchema,
        }),
      100,
    );
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

  const childRef = useRef<HTMLDivElement>(null);

  const scaleChild = (entries: any) => {
    if (!childRef.current) return;
    const parentWidth = entries[0]!?.offsetWidth; // 获取父容器的宽度
    const scaleX = parentWidth / 900; // 计算宽度缩放比例
    childRef.current!.style.transform = `scale(${scaleX})`; // 应用缩放
  };

  const resizeObserver = new ResizeObserver(scaleChild);
  resizeObserver.observe(containerRef.current!); // 监听父容器的大小变化
  scaleChild([{ contentRect: parent.getBoundingClientRect() }]); // 初始化一次缩放

  return (
    <div
      ref={containerRef}
      className={classNames(
        `${prefix}-slide-viewer`,
        { [`${prefix}-theme-${theme}`]: theme },
        className,
      )}
      style={{ ...style, height }}
    >
      <div className={classNames('child')} ref={childRef}>
        {children}
      </div>
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  XStarSlideViewer.displayName = 'XStarSlideViewer';
}

export default XStarSlideViewer;

export const useSlideViewerRef = () => useRef<XStarSlideViewerHandle>(null);
