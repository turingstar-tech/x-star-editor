import { useFullscreen } from 'ahooks';
import classNames from 'classnames';
import html2canvas from 'html2canvas';
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import SignaturePad from 'signature_pad';
import { ViewerOptions } from 'x-star-editor/x-star-md-viewer/index.js';
import workerRaw from '../../workers-dist/markdown.worker.js';
import SvgEnterFullscreen from '../icons/EnterFullscreen';
import SvgHelp from '../icons/Help';
import SvgStrong from '../icons/Strong';
import SvgViewOnly from '../icons/ViewOnly';
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
  getSlideContainer: () => HTMLDivElement;
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

  /**
   * 内部PPT的样式
   */
  slideClassName?: string;
}

enum OperationType {
  NONE,
  DRAW,
  ERASE,
}

const XStarSlideViewer = React.forwardRef<
  XStarSlideViewerHandle,
  XStarSlideViewerProps
>(
  (
    { className, style, height, theme, value = '', plugins, slideClassName },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const childRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const signaturePadRef = useRef<SignaturePad | null>(null);
    const containerWidth = useRef(0);
    const [operationType, setOperationType] = useState(OperationType.NONE);
    const pathBeginWidth = useRef(0);
    const [strokeColor, setStrokeColor] = useState('#4285f4');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [eraseWidth, setEraseWidth] = useState(5);

    const [, { toggleFullscreen }] = useFullscreen(containerRef);

    useEffect(() => {
      if (canvasRef.current) {
        signaturePadRef.current = new SignaturePad(canvasRef.current, {
          penColor: '#4285f4',
        });
        signaturePadRef.current.addEventListener('beginStroke', () => {
          pathBeginWidth.current = Number(
            canvasRef.current!.style.width.replace('px', ''),
          );
        });
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getViewerContainer: () => containerRef.current!,
        getSlideContainer: () => childRef.current!,
      }),
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
          URL.createObjectURL(
            new Blob([workerRaw], { type: 'text/javascript' }),
          ),
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

    useEffect(() => {
      if (operationType !== OperationType.NONE) {
        canvasRef.current!.style.pointerEvents = 'auto';
      } else {
        canvasRef.current!.style.pointerEvents = 'none';
      }
    }, [operationType]);

    const scaleChild = (entries: any) =>
      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const parentWidth = entries[0]!?.contentRect.width; // 获取父容器的宽度
        containerWidth.current = parentWidth;
        childRef.current!.style.transform = `scale(${parentWidth / 960})`;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvasRef.current!.style.width = `${parentWidth * ratio}px`;
        canvasRef.current!.style.height = `${parentWidth * (9 / 16) * ratio}px`;
        canvasRef.current!.width = parentWidth * ratio;
        canvasRef.current!.height = parentWidth * (9 / 16) * ratio;
        const data = signaturePadRef.current!.toData();
        data.forEach(({ points }) =>
          points.forEach((point) => {
            point.x = (point.x * parentWidth) / pathBeginWidth.current;
            point.y = (point.y * parentWidth) / pathBeginWidth.current;
          }),
        );
        signaturePadRef.current!.fromData(data);
        pathBeginWidth.current = Number(
          canvasRef.current!.style.width.replace('px', ''),
        );
      });

    const resizeObserver = new ResizeObserver(scaleChild);

    useEffect(() => {
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      return () => {
        resizeObserver.disconnect();
      };
    }, [containerRef.current]);

    useEffect(() => {
      if (operationType === OperationType.DRAW) {
        signaturePadRef.current!.penColor = strokeColor;
        signaturePadRef.current!.minWidth = strokeWidth - 2;
        signaturePadRef.current!.maxWidth = strokeWidth;
      } else if (operationType === OperationType.ERASE) {
        signaturePadRef.current!.minWidth = eraseWidth - 2;
        signaturePadRef.current!.maxWidth = eraseWidth;
      }
    }, [strokeColor, strokeWidth, eraseWidth]);

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
        <div className={classNames('slide', slideClassName)} ref={childRef}>
          {children}
        </div>
        <canvas ref={canvasRef} className={classNames('pad')} />
        <div className={classNames('btn-container')}>
          <span className={classNames('common-btn')} onClick={toggleFullscreen}>
            <SvgEnterFullscreen />
          </span>
          <span
            className={classNames('common-btn', 'shot')}
            onClick={async () => {
              const canvas = await html2canvas(containerRef.current!, {
                ignoreElements: (e) => e.classList.contains('btn-container'),
              });
              const a = document.createElement('a');
              a.href = canvas.toDataURL('image/png');
              a.download = 'ppt.png';
              a.click();
            }}
          >
            <SvgHelp />
          </span>
          <div>
            <span
              className={classNames('common-btn', 'draw')}
              style={{
                backgroundColor:
                  operationType === OperationType.DRAW
                    ? 'rgb(66, 133, 244)'
                    : '',
              }}
              onClick={async () => {
                if (operationType !== OperationType.DRAW) {
                  signaturePadRef.current!.compositeOperation = 'source-over';
                  setOperationType(OperationType.DRAW);
                } else {
                  setOperationType(OperationType.NONE);
                }
              }}
            >
              <SvgStrong />
            </span>
            <div className={classNames('pop-over', 'draw-pop-over')}>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => {
                  setStrokeColor(e.target.value);
                }}
              />
              <input
                type="range"
                min={1}
                max={10}
                value={strokeWidth}
                onChange={(e) => {
                  setStrokeWidth(Number(e.target.value));
                }}
              />
            </div>
          </div>
          <div>
            <span
              className={classNames('common-btn', 'erase')}
              style={{
                backgroundColor:
                  operationType === OperationType.ERASE
                    ? 'rgb(66, 133, 244)'
                    : '',
              }}
              onClick={async () => {
                if (operationType !== OperationType.ERASE) {
                  signaturePadRef.current!.compositeOperation =
                    'destination-out';
                  setOperationType(OperationType.ERASE);
                } else {
                  setOperationType(OperationType.NONE);
                }
              }}
            >
              <SvgViewOnly />
            </span>
            <div className={classNames('pop-over', 'erase-pop-over')}>
              <input
                type="range"
                min={5}
                max={50}
                value={eraseWidth}
                onChange={(e) => {
                  setEraseWidth(Number(e.target.value));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

if (process.env.NODE_ENV !== 'production') {
  XStarSlideViewer.displayName = 'XStarSlideViewer';
}

export default XStarSlideViewer;

export const useSlideViewerRef = () => useRef<XStarSlideViewerHandle>(null);
