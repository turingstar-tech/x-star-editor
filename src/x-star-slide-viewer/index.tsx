import classNames from 'classnames';
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import SignaturePad from 'signature_pad';
import workerRaw from '../../workers-dist/markdown.worker.js';
import SvgClear from '../icons/Clear';
import SvgEnterFullscreen from '../icons/EnterFullscreen';
import SvgEraser from '../icons/Eraser';
import SvgPencil from '../icons/Pencil';
import SvgRedo from '../icons/Redo';
import SvgUndo from '../icons/Undo';
import { useLocale } from '../locales';
import { prefix } from '../utils/global';
import { composeHandlers } from '../utils/handler';
import {
  getDefaultSchema,
  postViewerRender,
  preViewerRender,
} from '../utils/markdown';
import type { PadValue } from '../utils/slide';
import { getScaledData } from '../utils/slide';
import type { ViewerOptions } from '../x-star-md-viewer';

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
   * 内部 Slide 容器 CSS 类名
   */
  slideClassName?: string;

  /**
   * 文本
   */
  value?: string;

  /**
   * 插件
   */
  plugins?: XStarSlideViewerPlugin[];

  /**
   * 初始画板数据
   */
  initialPadValue?: PadValue;

  /**
   * 画板改变回调函数
   */
  onPadChange?: (value: PadValue) => void;
}

enum OperationType {
  NONE,
  PENCIL,
  ERASER,
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
      slideClassName,
      value = '',
      plugins,
      initialPadValue,
      onPadChange,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const childRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const padRef = useRef<SignaturePad | null>(null);

    /**
     * 画板历史保存上限
     */
    const MAX_STEP = 100;

    /**
     * 画板历史
     */
    const history = useRef<{ states: PadValue[]; index: number }>({
      states: [],
      index: 0,
    });

    /**
     * 缩放值
     */
    const scale = useRef(1);

    const [operationType, setOperationType] = useState(OperationType.NONE);
    const [pencilColor, setPencilColor] = useState('#4285f4');
    const [pencilWidth, setPencilWidth] = useState(3);
    const [eraserWidth, setEraserWidth] = useState(10);

    const { format: t } = useLocale('slideViewer');

    useEffect(() => {
      padRef.current = new SignaturePad(canvasRef.current!, {
        penColor: pencilColor,
      });

      if (initialPadValue) {
        // 初始画板数据
        padRef.current.fromData(getScaledData(initialPadValue, 1280));
        history.current = {
          states: [JSON.parse(JSON.stringify(initialPadValue))],
          index: 0,
        };
      } else {
        history.current = { states: [{ data: [], scale: 1 }], index: 0 };
      }

      padRef.current.addEventListener('endStroke', () => {
        // 结束画笔，记录此时画板数据
        const value = {
          data: padRef.current!.toData(),
          scale: scale.current,
        };
        const { states, index } = history.current;
        history.current = {
          states: [
            ...states.slice(
              index < MAX_STEP ? 0 : index - MAX_STEP + 1,
              index + 1,
            ),
            // 保存画板数据
            JSON.parse(JSON.stringify(value)),
          ],
          index: index < MAX_STEP ? index + 1 : MAX_STEP,
        };
        // 画板改变回调
        onPadChange?.(value);
      });
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
        // plugins 是一个数组，里面是一些函数
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
        () => containerRef.current!.dispatchEvent(new Event('render')),
        100,
      );
      return () => window.clearTimeout(timer);
    }, [children]);

    const resizeObserver = new ResizeObserver((entries) => {
      // 组件卸载时可能调用该函数，但 DOM 元素不存在
      if (!childRef.current || !canvasRef.current || !padRef.current) {
        return;
      }
      // 处理尺寸改变
      const parentWidth = entries[0].contentRect.width;
      childRef.current.style.transform = `scale(${parentWidth / 1280})`;
      canvasRef.current.width = parentWidth;
      canvasRef.current.height = parentWidth / (16 / 9);
      padRef.current.fromData(
        getScaledData(
          { data: padRef.current.toData(), scale: scale.current },
          parentWidth,
        ),
      );
      scale.current = parentWidth / 1280;
    });

    // 监听容器尺寸改变
    useEffect(() => {
      resizeObserver.observe(containerRef.current!);
      return () => resizeObserver.disconnect();
    }, []);

    // 处理操作切换
    useEffect(() => {
      if (operationType === OperationType.PENCIL) {
        canvasRef.current!.style.pointerEvents = 'auto';
        padRef.current!.penColor = pencilColor;
        padRef.current!.maxWidth = pencilWidth;
        padRef.current!.minWidth = pencilWidth - 2;
        padRef.current!.compositeOperation = 'source-over';
      } else if (operationType === OperationType.ERASER) {
        canvasRef.current!.style.pointerEvents = 'auto';
        padRef.current!.maxWidth = eraserWidth;
        padRef.current!.minWidth = eraserWidth;
        padRef.current!.compositeOperation = 'destination-out';
      } else {
        canvasRef.current!.style.pointerEvents = 'none';
      }
    }, [operationType, pencilColor, pencilWidth, eraserWidth]);

    /**
     * 撤销画板操作
     */
    const handleUndo = () => {
      const { states, index } = history.current;
      if (!index) {
        return;
      }
      padRef.current!.fromData(
        getScaledData(states[index - 1], scale.current * 1280),
      );
      history.current = { states, index: index - 1 };
    };

    /**
     * 恢复画板操作
     */
    const handleRedo = () => {
      const { states, index } = history.current;
      if (index === states.length - 1) {
        return;
      }
      padRef.current!.fromData(
        getScaledData(states[index + 1], scale.current * 1280),
      );
      history.current = { states, index: index + 1 };
    };

    // useEventListener(
    //   'keydown',
    //   createKeybindingsHandler({
    //     '$mod+KeyZ': (e) => {
    //       e.preventDefault();
    //       handleUndo();
    //     },
    //     '$mod+KeyY': (e) => {
    //       e.preventDefault();
    //       handleRedo();
    //     },
    //   }),
    // );

    // useEventListener('mousemove', (event) => {
    //   if (operationType !== OperationType.ERASER || !containerRef.current || !circle.current) return;
    //   const x = event.clientX - containerRef.current.offsetLeft;
    //   const y = event.clientY - containerRef.current.offsetTop;
    //   circle.current.style.left = x + 'px';
    //   circle.current.style.top = y + 'px';
    // }, { target: canvasRef.current })

    /**
     * 清空画板
     */
    const handleClear = () => {
      const { states, index } = history.current;
      if (!states[index].data.length) {
        return;
      }
      padRef.current!.clear();
      history.current = {
        states: [
          ...states.slice(
            index < MAX_STEP ? 0 : index - MAX_STEP + 1,
            index + 1,
          ),
          { data: [], scale: 1 },
        ],
        index: index < MAX_STEP ? index + 1 : MAX_STEP,
      };
    };

    // const handleScreenshot = async () => {
    //   const canvas = await html2canvas(containerRef.current!, {
    //     ignoreElements: (e) => e.id === 'btn-container',
    //   });
    //   const a = document.createElement('a');
    //   a.href = canvas.toDataURL('image/png');
    //   a.download = 'slide.png';
    //   a.click();
    // };

    /**
     * 切换橡皮
     */
    const handleToggleEraser = () =>
      setOperationType(
        operationType === OperationType.ERASER
          ? OperationType.NONE
          : OperationType.ERASER,
      );

    /**
     * 切换画笔
     */
    const handleTogglePencil = () =>
      setOperationType(
        operationType === OperationType.PENCIL
          ? OperationType.NONE
          : OperationType.PENCIL,
      );

    /**
     * 切换全屏
     */
    const handleToggleFullscreen = () => {
      if (document.fullscreenElement === containerRef.current) {
        document.exitFullscreen();
      } else {
        containerRef.current!.requestFullscreen();
      }
    };

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
        <div
          ref={childRef}
          className={classNames(`${prefix}-slide`, slideClassName)}
        >
          {children}
        </div>
        <canvas
          ref={canvasRef}
          className={classNames(`${prefix}-pad`, {
            [`${prefix}-custom-cursor-pencil`]:
              operationType === OperationType.PENCIL,
            [`${prefix}-custom-cursor-eraser`]:
              operationType === OperationType.ERASER,
          })}
        />
        <div className={classNames(`${prefix}-btn-container`)}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              className={classNames(`${prefix}-common-btn`)}
              onClick={handleToggleFullscreen}
            >
              <SvgEnterFullscreen />
            </span>
            <div className={classNames(`${prefix}-tooltip`)}>
              {t('fullscreen')}
            </div>
          </div>
          {/* <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              className={classNames(`${prefix}-common-btn`)}
              onClick={handleScreenshot}
            >
              <SvgScreenshot />
            </span>
            <div className={classNames(`${prefix}-tooltip`)}>
              {t('screenshot')}
            </div>
          </div> */}
          <div>
            <span
              className={classNames(`${prefix}-common-btn`)}
              style={{
                backgroundColor:
                  operationType === OperationType.PENCIL
                    ? 'rgb(66, 133, 244)'
                    : '',
              }}
              onClick={handleTogglePencil}
            >
              <SvgPencil />
            </span>
            <div
              className={classNames(
                `${prefix}-popover`,
                `${prefix}-pencil-popover`,
              )}
            >
              <div>
                <span className={classNames(`${prefix}-popover-label`)}>
                  {t('pencil')}
                </span>
                <input
                  type="color"
                  value={pencilColor}
                  onChange={(e) => setPencilColor(e.target.value)}
                />
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={pencilWidth}
                onChange={(e) => setPencilWidth(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <span
              className={classNames(`${prefix}-common-btn`)}
              style={{
                backgroundColor:
                  operationType === OperationType.ERASER
                    ? 'rgb(66, 133, 244)'
                    : '',
              }}
              onClick={handleToggleEraser}
            >
              <SvgEraser />
            </span>
            <div
              className={classNames(
                `${prefix}-popover`,
                `${prefix}-eraser-popover`,
              )}
            >
              <span className={classNames(`${prefix}-popover-label`)}>
                {t('eraser')}
              </span>
              <input
                type="range"
                min={5}
                max={50}
                value={eraserWidth}
                onChange={(e) => setEraserWidth(Number(e.target.value))}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              className={classNames(`${prefix}-common-btn`)}
              onClick={handleClear}
            >
              <SvgClear />
            </span>
            <div className={classNames(`${prefix}-tooltip`)}>{t('clear')}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              className={classNames(`${prefix}-common-btn`)}
              onClick={handleRedo}
            >
              <SvgRedo />
            </span>
            <div className={classNames(`${prefix}-tooltip`)}>{t('redo')}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              className={classNames(`${prefix}-common-btn`)}
              onClick={handleUndo}
            >
              <SvgUndo />
            </span>
            <div className={classNames(`${prefix}-tooltip`)}>{t('undo')}</div>
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
