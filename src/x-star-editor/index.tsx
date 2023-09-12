import classNames from 'classnames';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { prefix } from '../utils/global';
import type {
  XStarMdEditorHandle,
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
      className={classNames(`${prefix}md-viewer`, className)}
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
   * 初始文本
   */
  initialValue?: string;

  /**
   * 是否启用 Web Worker
   */
  enableWebWorker?: XStarMdViewerProps['enableWebWorker'];

  /**
   * 编辑器属性
   */
  editorProps?: Omit<
    XStarMdEditorProps,
    'height' | 'locale' | 'initialValue' | 'onChange' | 'onInsertFile'
  >;

  /**
   * 查看器属性
   */
  viewerProps?: Omit<
    XStarMdViewerProps,
    'height' | 'value' | 'enableWebWorker'
  >;

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
}

const XStarEditor = React.forwardRef<XStarEditorHandle, XStarEditorProps>(
  (
    {
      className,
      style,
      height,
      locale,
      initialValue = '',
      enableWebWorker,
      editorProps,
      viewerProps,
      viewerRender,
      onChange,
      onInsertFile,
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
            fromOffsetTops[fromOffsetTops.length - 1] >= fromLimit ||
            toOffsetTops[toOffsetTops.length - 1] >= toLimit;

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

      const listener = (e: Event) => {
        const ignore = ignoreNext;
        ignoreNext = false;
        if (ignore || !editor || !viewer) {
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
            const scrollTop =
              ((fromElement.scrollTop - fromOffsetTops[i]) /
                (fromOffsetTops[i + 1] - fromOffsetTops[i])) *
                (toOffsetTops[i + 1] - toOffsetTops[i]) +
              toOffsetTops[i];
            if (toElement.scrollTop !== scrollTop) {
              ignoreNext = true;
              toElement.scrollTop = scrollTop;
            }
            break;
          }
        }
      };

      editor?.addEventListener('scroll', listener, {
        capture: true,
        passive: true,
      });
      viewer?.addEventListener('scroll', listener, {
        capture: true,
        passive: true,
      });
      return () => {
        editor?.removeEventListener('scroll', listener, { capture: true });
        viewer?.removeEventListener('scroll', listener, { capture: true });
      };
    }, []);

    const [value, setValue] = useState(initialValue);

    return (
      <div
        ref={containerRef}
        className={classNames(`${prefix}editor`, className)}
        style={style}
      >
        <XStarMdEditor
          ref={editorRef}
          {...editorProps}
          height={height}
          locale={locale}
          initialValue={initialValue}
          onChange={(value) => {
            setValue(value);
            onChange?.(value);
          }}
          onInsertFile={onInsertFile}
        />
        {viewerRender ? (
          <ViewerRenderWrapper
            ref={viewerRef}
            className={viewerProps?.className}
            style={viewerProps?.style}
            height={height}
          >
            {viewerRender(value)}
          </ViewerRenderWrapper>
        ) : (
          <XStarMdViewer
            ref={viewerRef}
            {...viewerProps}
            height={height}
            value={value}
            enableWebWorker={enableWebWorker}
          />
        )}
      </div>
    );
  },
);

if (process.env.NODE_ENV !== 'production') {
  XStarEditor.displayName = 'XStarEditor';
}

export default XStarEditor;

export const useEditorRef = () => useRef<XStarEditorHandle>(null);
