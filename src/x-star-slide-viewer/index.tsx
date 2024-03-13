import { useEventListener, useFullscreen } from 'ahooks';
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
import SvgDelete from '../icons/Delete';
import SvgEnterFullscreen from '../icons/EnterFullscreen';
import SvgHelp from '../icons/Help';
import SvgStrong from '../icons/Strong';
import SvgUndo from '../icons/Undo';
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

  /**
   * 一笔stroke后的回调
   */
  onStrokeEnd?: (val: any) => void;

  /**
   * canvas初始数据
   */
  canvasInitData?: any;
}

enum OperationType {
  NONE,
  STROKE,
  ERASE,
}

const XStarSlideViewer = React.forwardRef<
  XStarSlideViewerHandle,
  XStarSlideViewerProps
>(
  (
    {
      className,
      style,
      height,
      theme,
      value = '',
      plugins,
      slideClassName,
      onStrokeEnd,
      canvasInitData,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const childRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const signaturePadRef = useRef<SignaturePad | null>(null);
    const clearHistoryRef = useRef<any[]>([]); // 保存清除历史
    const laterStepRef = useRef<number[]>([0]); // 保存清空后的步数
    const pathBeginScale = useRef(1);
    const [operationType, setOperationType] = useState(OperationType.NONE);
    const [strokeColor, setStrokeColor] = useState('#4285f4');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [eraseWidth, setEraseWidth] = useState(5);

    const [, { toggleFullscreen }] = useFullscreen(containerRef);

    useEffect(() => {
      if (canvasRef.current) {
        signaturePadRef.current = new SignaturePad(canvasRef.current, {
          penColor: '#4285f4',
        });
        if (canvasInitData) {
          signaturePadRef.current.fromData(canvasInitData);
        }
        signaturePadRef.current.addEventListener('beginStroke', () => {
          pathBeginScale.current = Number(
            childRef
              .current!.style.transform.replace('scale(', '')
              .replace(')', ''),
          );
        });
        signaturePadRef.current.addEventListener('endStroke', () => {
          const last = Number(laterStepRef.current?.pop()) + 1; // 画完一笔后，步数加1（栈顶元素+1）
          laterStepRef.current.push(last);
          onStrokeEnd?.(signaturePadRef.current?.toData());
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
        childRef.current!.style.transform = `scale(${parentWidth / 960})`;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvasRef.current!.width = parentWidth * ratio;
        canvasRef.current!.height = parentWidth * (9 / 16) * ratio;
        const data = signaturePadRef.current!.toData();
        data.forEach(({ points }) =>
          points.forEach((point) => {
            point.x = (point.x / pathBeginScale.current) * (parentWidth / 960);
            point.y = (point.y / pathBeginScale.current) * (parentWidth / 960);
          }),
        );
        signaturePadRef.current!.fromData(data);
        pathBeginScale.current = Number(
          childRef
            .current!.style.transform.replace('scale(', '')
            .replace(')', ''),
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
    }, []);

    useEffect(() => {
      if (operationType === OperationType.STROKE) {
        signaturePadRef.current!.penColor = strokeColor;
        signaturePadRef.current!.minWidth = strokeWidth - 2;
        signaturePadRef.current!.maxWidth = strokeWidth;
      } else if (operationType === OperationType.ERASE) {
        signaturePadRef.current!.minWidth = eraseWidth - 2;
        signaturePadRef.current!.maxWidth = eraseWidth;
      }
    }, [strokeColor, strokeWidth, eraseWidth, operationType]);

    const handleUndo = () => {
      const data = signaturePadRef.current!.toData();
      if (
        laterStepRef.current?.[laterStepRef.current.length - 1] === 0 &&
        laterStepRef.current.length > 1
      ) {
        // 如果当前步数为0，且栈中有多于一个元素
        laterStepRef.current.pop(); // 删除栈顶元素
        signaturePadRef.current!.fromData(clearHistoryRef.current?.pop()); // 从清空历史中取出上一次清空前的画布数据 从数据中恢复画布
        return;
      }
      if (data) {
        data.pop(); // remove the last dot or line
        const last = Number(laterStepRef.current?.pop()) - 1; // 撤销一笔，步数减1（栈顶元素-1）
        laterStepRef.current.push(last);
        signaturePadRef.current!.fromData(data);
      }
    };

    const handleClear = () => {
      if (laterStepRef.current[laterStepRef.current.length - 1] === 0) return; // 如果当前步数为0，不做任何操作
      clearHistoryRef.current?.push(signaturePadRef.current?.toData()); // 当前画布数据入栈
      laterStepRef.current.push(0); // 清空后，步数变为0（加入栈顶元素0）
      signaturePadRef.current!.clear(); // 清空画布
    };

    useEventListener('keydown', (event) => {
      if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
        handleUndo();
      }
    });

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
          <canvas
            ref={canvasRef}
            className={classNames(
              'pad',
              {
                [`custom-cursor-pencil`]:
                  operationType === OperationType.STROKE,
              },
              {
                [`custom-cursor-eraser`]: operationType === OperationType.ERASE,
              },
            )}
            width={960}
            height={540}
          />
        </div>

        <div className={classNames('btn-container')}>
          <span className={classNames('common-btn')} onClick={toggleFullscreen}>
            <SvgEnterFullscreen />
          </span>
          <span
            className={classNames('common-btn', 'shot')}
            onClick={async () => {
              const canvas = await html2canvas(childRef.current!, {
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
                  operationType === OperationType.STROKE
                    ? 'rgb(66, 133, 244)'
                    : '',
              }}
              onClick={() => {
                if (operationType !== OperationType.STROKE) {
                  signaturePadRef.current!.compositeOperation = 'source-over';
                  setOperationType(OperationType.STROKE);
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
              onClick={() => {
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
          <span
            className={classNames('common-btn', 'clear')}
            onClick={handleClear}
          >
            <SvgDelete />
          </span>
          <span
            className={classNames('common-btn', 'undo')}
            onClick={handleUndo}
          >
            <SvgUndo />
          </span>
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
