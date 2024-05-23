import classNames from 'classnames';
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createKeybindingsHandler } from 'tinykeys';
import { containerRefContext } from '../../src/context/containerRefContext';
import SvgEditOnly from '../icons/EditOnly';
import SvgEnterFullscreen from '../icons/EnterFullscreen';
import SvgExitFullscreen from '../icons/ExitFullscreen';
import SvgViewOnly from '../icons/ViewOnly';
import { getFormat } from '../locales';
import { prefix } from '../utils/global';
import type {
  XStarMdEditorHandle,
  XStarMdEditorPlugin,
  XStarMdEditorProps,
} from '../x-star-md-editor';
import XStarMdEditor, { useMdEditorRef } from '../x-star-md-editor';
import type {
  XStarMdViewerHandle,
  XStarMdViewerProps,
} from '../x-star-md-viewer';
import XStarMdViewer, { useMdViewerRef } from '../x-star-md-viewer';

const ViewerRenderWrapper = React.forwardRef<
  XStarMdViewerHandle,
  {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    height?: React.CSSProperties['height'];
  }
>(({ children, className, style, height }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({ getViewerContainer: () => containerRef.current! }),
    [],
  );

  return (
    <div
      ref={containerRef}
      className={classNames(`${prefix}-md-viewer`, className)}
      style={{ ...style, height }}
    >
      {children}
    </div>
  );
});

export interface XStarEditorHandle
  extends XStarMdEditorHandle,
    XStarMdViewerHandle {
  getContainer: () => HTMLDivElement;
}

export type ThemeType = 'xcamp' | 'xyd';

export interface XStarEditorProps {
  /**
   * CSS 类名
   */
  className?: string;

  /**
   * CSS 样式
   */
  style?: React.CSSProperties;

  /**
   * 编辑器和查看器的高度（不包括工具栏）
   */
  height?: React.CSSProperties['height'];

  /**
   * 语言
   */
  locale?: XStarMdEditorProps['locale'];

  /**
   * 文本为空时显示的提示
   */
  placeholder?: string;

  /**
   * 初始文本
   */
  initialValue?: string;

  /**
   * 文本
   */
  value?: string;

  /**
   * 是否只读
   */
  readOnly?: XStarMdEditorProps['readOnly'];

  /**
   * 编辑器属性
   */
  editorProps?: Omit<
    XStarMdEditorProps,
    | 'height'
    | 'locale'
    | 'placeholder'
    | 'initialValue'
    | 'value'
    | 'readOnly'
    | 'onChange'
    | 'onInsertFile'
  >;

  /**
   * 查看器属性
   */
  viewerProps?: Omit<XStarMdViewerProps, 'height' | 'value'>;

  /**
   * 自定义查看器渲染函数
   */
  viewerRender?: (value: string) => React.ReactNode;

  /**
   * 文本变化回调函数
   */
  onChange?: XStarMdEditorProps['onChange'];

  /**
   * 文件插入回调函数
   */
  onInsertFile?: XStarMdEditorProps['onInsertFile'];

  /**
   * 编辑器主题
   */
  themeType?: ThemeType;
}

const XStarEditor = React.forwardRef<XStarEditorHandle, XStarEditorProps>(
  (
    {
      className,
      style,
      height,
      locale,
      placeholder,
      initialValue = '',
      value,
      readOnly,
      editorProps,
      viewerProps,
      viewerRender,
      onChange,
      onInsertFile,
      themeType = 'xyd',
    },
    ref,
  ) => {
    const editorRef = useMdEditorRef();
    const viewerRef = useMdViewerRef();
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        ...editorRef.current!,
        ...viewerRef.current!,
        getContainer: () => containerRef.current!,
      }),
      [],
    );

    // 同步滚动
    useEffect(() => {
      const editor = editorRef.current?.getEditorContainer();
      const viewer = viewerRef.current?.getViewerContainer();
      if (!editor || !viewer) {
        return;
      }

      /**
       * 获取两个父元素的子元素到各自父元素顶部的距离
       *
       * @param fromElement 第一个父元素
       * @param toElement 第二个父元素
       * @returns 子元素到各自父元素顶部的距离
       */
      const getOffsetTops = (
        fromElement: HTMLDivElement,
        toElement: HTMLDivElement,
      ): [number[], number[]] => {
        const fromOffsetTops = [0];
        const toOffsetTops = [0];
        const fromLimit = fromElement.scrollHeight - fromElement.clientHeight;
        const toLimit = toElement.scrollHeight - toElement.clientHeight;

        if (fromLimit > 0 && toLimit > 0) {
          for (
            let i = 0, j = 0;
            i < fromElement.children.length && j < toElement.children.length;

          ) {
            const fromChild = fromElement.children[i];
            const toChild = toElement.children[j];
            if (!(fromChild instanceof HTMLElement)) {
              i++;
            } else if (!(toChild instanceof HTMLElement)) {
              j++;
            } else {
              const fromLine = parseInt(fromChild.dataset.line ?? '');
              const toLine = parseInt(toChild.dataset.line ?? '');
              if (!fromLine) {
                i++;
              } else if (!toLine) {
                j++;
              } else if (fromLine < toLine) {
                i++;
              } else if (fromLine > toLine) {
                j++;
              } else {
                fromOffsetTops.push(fromChild.offsetTop);
                toOffsetTops.push(toChild.offsetTop);
                i++;
                j++;
              }
            }
          }

          for (
            ;
            fromOffsetTops.at(-1)! >= fromLimit ||
            toOffsetTops.at(-1)! >= toLimit;

          ) {
            fromOffsetTops.pop();
            toOffsetTops.pop();
          }

          fromOffsetTops.push(fromLimit);
          toOffsetTops.push(toLimit);
        }

        return [fromOffsetTops, toOffsetTops];
      };

      /**
       * 是否忽略下一个滚动事件
       */
      let ignoreNext = false;

      const listener = (e: { currentTarget: EventTarget | null }) => {
        const ignore = ignoreNext;
        ignoreNext = false;
        if (ignore) {
          return;
        }

        const [fromElement, toElement] =
          e.currentTarget === editor ? [editor, viewer] : [viewer, editor];
        const [fromOffsetTops, toOffsetTops] = getOffsetTops(
          fromElement,
          toElement,
        );

        for (let i = 0; i < fromOffsetTops.length - 1; i++) {
          if (
            fromOffsetTops[i] <= fromElement.scrollTop &&
            fromElement.scrollTop < fromOffsetTops[i + 1]
          ) {
            const scrollTop = Math.round(
              ((fromElement.scrollTop - fromOffsetTops[i]) /
                (fromOffsetTops[i + 1] - fromOffsetTops[i])) *
                (toOffsetTops[i + 1] - toOffsetTops[i]) +
                toOffsetTops[i],
            );
            if (toElement.scrollTop !== scrollTop) {
              ignoreNext = true;
              toElement.scrollTop = scrollTop;
            }
            break;
          }
        }
      };

      const render = () => listener({ currentTarget: editor });

      editor.addEventListener('scroll', listener);
      viewer.addEventListener('scroll', listener);
      // 查看器子节点更新时会手动触发该事件
      viewer.addEventListener('render', render);
      return () => {
        editor.removeEventListener('scroll', listener);
        viewer.removeEventListener('scroll', listener);
        viewer.removeEventListener('render', render);
      };
    }, []);

    const [layout, setLayout] = useState<('editor' | 'viewer')[]>([
      'editor',
      'viewer',
    ]);
    const editOnly = layout.includes('editor') && !layout.includes('viewer');
    const viewOnly = !layout.includes('editor') && layout.includes('viewer');

    const [fullscreen, setFullscreen] = useState(false);

    const editorPlugins = useMemo<XStarMdEditorPlugin[]>(
      () => [
        (ctx) => {
          const t = getFormat(locale, 'toolbarItem');

          ctx.toolbarItemMap.editOnly = {
            children: (
              <SvgEditOnly
                className={classNames(`${prefix}-icon`, {
                  [`${prefix}-active`]: editOnly,
                })}
              />
            ),
            tooltip: t('editOnly'),
            onClick: () =>
              setLayout(editOnly ? ['editor', 'viewer'] : ['editor']),
          };

          ctx.toolbarItemMap.viewOnly = {
            children: (
              <SvgViewOnly
                className={classNames(`${prefix}-icon`, {
                  [`${prefix}-active`]: viewOnly,
                })}
              />
            ),
            tooltip: t('viewOnly'),
            onClick: () =>
              setLayout(viewOnly ? ['editor', 'viewer'] : ['viewer']),
          };

          ctx.toolbarItemMap.fullscreen = {
            children: fullscreen ? (
              <SvgExitFullscreen className={classNames(`${prefix}-icon`)} />
            ) : (
              <SvgEnterFullscreen className={classNames(`${prefix}-icon`)} />
            ),
            tooltip: fullscreen ? t('exitFullscreen') : t('enterFullscreen'),
            onClick: () => setFullscreen(!fullscreen),
          };

          ctx.toolbarItems.push(['editOnly', 'viewOnly', 'fullscreen']);
        },
        ...(editorProps?.plugins ?? []),
      ],
      [locale, editOnly, viewOnly, fullscreen, editorProps?.plugins],
    );

    // 防止出现两个滚动条，按下 Esc 退出全屏
    useEffect(() => {
      if (fullscreen) {
        const { overflow } = document.body.style;
        const listener = createKeybindingsHandler({
          Escape: (e) => {
            e.stopImmediatePropagation();
            setFullscreen(false);
          },
        });

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', listener, { capture: true });
        return () => {
          document.body.style.overflow = overflow;
          document.removeEventListener('keydown', listener, { capture: true });
        };
      }
    }, [fullscreen]);

    useEffect(() => {
      if (!themeType) return;
      containerRef?.current?.parentElement?.setAttribute(
        'data-theme',
        themeType,
      );
    }, [themeType]);

    const [sourceCode, setSourceCode] = useState(value ?? initialValue);

    return (
      <containerRefContext.Provider value={{ editorRef, viewerRef }}>
        <div
          ref={containerRef}
          className={classNames(
            `${prefix}-editor`,
            { [`${prefix}-fullscreen`]: fullscreen },
            className,
          )}
          style={style}
        >
          <XStarMdEditor
            ref={editorRef}
            {...editorProps}
            className={classNames(
              {
                [`${prefix}-active`]: editOnly,
                [`${prefix}-hidden`]: viewOnly,
              },
              editorProps?.className,
            )}
            height={height}
            locale={locale}
            placeholder={placeholder}
            value={value ?? sourceCode}
            readOnly={viewOnly || readOnly}
            plugins={editorPlugins}
            onChange={(value) => {
              setSourceCode(value);
              onChange?.(value);
            }}
            onInsertFile={onInsertFile}
          />
          {viewerRender ? (
            <ViewerRenderWrapper
              ref={viewerRef}
              className={classNames(
                {
                  [`${prefix}-active`]: viewOnly,
                  [`${prefix}-hidden`]: editOnly,
                },
                viewerProps?.className,
              )}
              style={viewerProps?.style}
              height={height}
            >
              {viewerRender(value ?? sourceCode)}
            </ViewerRenderWrapper>
          ) : (
            <XStarMdViewer
              ref={viewerRef}
              canContentEditable={!viewOnly && !editOnly}
              {...viewerProps}
              className={classNames(
                {
                  [`${prefix}-active`]: viewOnly,
                  [`${prefix}-hidden`]: editOnly,
                },
                viewerProps?.className,
              )}
              height={height}
              value={value ?? sourceCode}
            />
          )}
        </div>
      </containerRefContext.Provider>
    );
  },
);

if (process.env.NODE_ENV !== 'production') {
  XStarEditor.displayName = 'XStarEditor';
}

export default XStarEditor;

export const useEditorRef = () => useRef<XStarEditorHandle>(null);
