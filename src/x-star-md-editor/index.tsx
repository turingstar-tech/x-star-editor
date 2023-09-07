import classNames from 'classnames';
import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { ToolbarItemMap, ToolbarItems } from '../components/Toolbar';
import Toolbar, {
  getDefaultToolbarItemMap,
  getDefaultToolbarItems,
} from '../components/Toolbar';
import { LocaleProvider } from '../locales';
import type { ContainerSelection } from '../utils/container';
import { getRange, useContainer } from '../utils/container';
import { prefix } from '../utils/global';
import type { Executor, KeyboardEventHandler } from '../utils/handler';
import {
  composeHandlers,
  getDefaultKeyboardEventHandlers,
} from '../utils/handler';
import { useHistory } from '../utils/history';

interface EditorOptions {
  /**
   * 工具栏项映射
   */
  toolbarItemMap: ToolbarItemMap;

  /**
   * 工具栏项数组
   */
  toolbarItems: ToolbarItems;

  /**
   * 键盘事件处理函数
   */
  keyboardEventHandlers: KeyboardEventHandler[];
}

export interface XStarMdEditorPlugin {
  (ctx: EditorOptions): void;
}

export interface XStarMdEditorHandle {
  exec: Executor;
  getEditorContainer: () => HTMLDivElement;
}

export interface XStarMdEditorProps {
  /**
   * CSS 类名
   */
  className?: string;

  /**
   * CSS 样式
   */
  style?: React.CSSProperties;

  /**
   * 编辑器的高度（不包括工具栏）
   */
  height?: React.CSSProperties['height'];

  /**
   * 工具栏 CSS 类名
   */
  toolbarClassName?: string;

  /**
   * 工具栏 CSS 样式
   */
  toolbarStyle?: React.CSSProperties;

  /**
   * 语言
   */
  locale?: string;

  /**
   * 初始文本
   */
  initialValue?: string;

  /**
   * 插件
   */
  plugins?: XStarMdEditorPlugin[];

  /**
   * 文本变化回调函数
   */
  onChange?: (value: string) => void;

  /**
   * 文件插入回调函数
   */
  onInsertFile?: (
    file: File,
    options: { description: string; image: boolean },
  ) => void;
}

const XStarMdEditor = React.forwardRef<XStarMdEditorHandle, XStarMdEditorProps>(
  (
    {
      className,
      style,
      height,
      toolbarClassName,
      toolbarStyle,
      locale,
      initialValue = '',
      plugins,
      onChange,
      onInsertFile,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const container = useContainer(containerRef);

    const { history, sourceCode, selection, dispatch } =
      useHistory(initialValue);

    const initialized = useRef(false);

    // 将文本同步到容器
    useEffect(() => {
      container.setText(sourceCode);
      if (initialized.current) {
        onChange?.(sourceCode);
      }
    }, [sourceCode]);

    // 将选区同步到容器
    useEffect(() => {
      if (initialized.current) {
        container.setSelection(selection);
      }
    }, [selection]);

    useEffect(() => {
      initialized.current = true;
      return () => {
        initialized.current = false;
      };
    }, []);

    const historyLatest = useRef(history);
    historyLatest.current = history;

    const sourceCodeLatest = useRef(sourceCode);
    sourceCodeLatest.current = sourceCode;

    /**
     * 失焦时的选区
     */
    const blurSelection = useRef(selection);

    /**
     * 获取选区，如果焦点不在容器内，则返回失焦时的选区
     *
     * @returns 选区
     */
    const getSelection = () => {
      const selection = container.getSelection();
      return selection.anchorOffset === -1 || selection.focusOffset === -1
        ? blurSelection.current
        : selection;
    };

    const exec = useRef<Executor>((handler) =>
      handler({
        history: historyLatest.current,
        sourceCode: sourceCodeLatest.current,
        selection: getSelection(),
        dispatch,
      }),
    ).current;

    useImperativeHandle(
      ref,
      () => ({ exec, getEditorContainer: () => containerRef.current! }),
      [],
    );

    const clipboardEventHandler = (e: React.ClipboardEvent) => {
      const selection = getSelection();
      const { startOffset, endOffset } = getRange(selection);

      switch (e.type) {
        case 'copy':
        case 'cut': {
          e.preventDefault();
          if (startOffset < endOffset) {
            e.clipboardData.setData(
              'text/plain',
              sourceCode.slice(startOffset, endOffset),
            );
            if (e.type === 'cut') {
              dispatch({ type: 'delete', selection });
            }
          }
          break;
        }

        case 'paste': {
          e.preventDefault();
          if (e.clipboardData.types.includes('text/plain')) {
            dispatch({
              type: 'insert',
              payload: { text: e.clipboardData.getData('text/plain') },
              selection,
            });
          } else if (e.clipboardData.types.includes('Files')) {
            const file = e.clipboardData.files[0];
            onInsertFile?.(file, {
              description: file.name,
              image: file.type.startsWith('image/'),
            });
          }
          break;
        }
      }
    };

    /**
     * 开始组合时的选区
     */
    const compositionStartSelection = useRef<ContainerSelection>();

    /**
     * 容器同步控制器
     */
    const syncController = useMemo(() => {
      let timer = 0;

      /**
       * 将最新的文本和选区同步到容器
       */
      const sync = () => {
        if (compositionStartSelection.current) {
          const selection = getSelection();
          container.setText(sourceCodeLatest.current);
          container.setSelection(selection);
          compositionStartSelection.current = undefined;
        }
        timer = 0;
      };

      return {
        /**
         * 在下个事件循环中同步
         */
        start: () => {
          if (!timer) {
            timer = window.setTimeout(sync);
          }
        },

        /**
         * 立即执行下个事件循环中的同步
         */
        flush: () => {
          if (timer) {
            window.clearTimeout(timer);
            sync();
          }
        },
      };
    }, []);

    const compositionEventHandler = (e: React.CompositionEvent) => {
      switch (e.type) {
        case 'compositionend': {
          syncController.start();
          break;
        }

        case 'compositionstart': {
          syncController.flush();
          compositionStartSelection.current = getSelection();
          break;
        }
      }
    };

    const dragEventHandler = (e: React.DragEvent) => {
      switch (e.type) {
        case 'drop': {
          const selection = getSelection();
          window.setTimeout(() => {
            container.normalize();
            dispatch({
              type: 'set',
              payload: {
                sourceCode: container.getText(),
                selection: getSelection(),
              },
              selection,
            });
          });
          break;
        }
      }
    };

    const focusEventHandler = (e: React.FocusEvent) => {
      switch (e.type) {
        case 'blur': {
          blurSelection.current = getSelection();
          break;
        }
      }
    };

    const formEventHandler = (e: React.FormEvent) => {
      switch (e.type) {
        case 'beforeinput': {
          e.preventDefault();
          if ('data' in e && typeof e.data === 'string') {
            dispatch({
              type: 'insert',
              payload: { text: e.data },
              selection: compositionStartSelection.current ?? getSelection(),
            });
            compositionStartSelection.current = undefined;
          }
          break;
        }
      }
    };

    const onInsertFileLatest = useRef(onInsertFile);
    onInsertFileLatest.current = onInsertFile;

    const options = useMemo(
      () =>
        composeHandlers(plugins)({
          toolbarItemMap: getDefaultToolbarItemMap(locale, (file, options) =>
            onInsertFileLatest.current?.(file, options),
          ),
          toolbarItems: getDefaultToolbarItems(),
          keyboardEventHandlers: getDefaultKeyboardEventHandlers(),
        }),
      [locale, plugins],
    );

    const keyboardEventHandler = (e: React.KeyboardEvent) => {
      switch (e.type) {
        case 'keydown': {
          if (compositionStartSelection.current) {
            e.preventDefault();
          } else {
            composeHandlers(options.keyboardEventHandlers)({
              history,
              sourceCode,
              selection: getSelection(),
              dispatch,
              e,
            });
          }
          break;
        }
      }
    };

    return (
      <LocaleProvider locale={locale}>
        <Toolbar
          className={classNames(toolbarClassName)}
          style={toolbarStyle}
          itemMap={options.toolbarItemMap}
          items={options.toolbarItems}
          exec={exec}
        />
        <div
          ref={containerRef}
          className={classNames(`${prefix}md-editor`, className)}
          style={{ ...style, height }}
          contentEditable
          onBeforeInput={formEventHandler}
          onBlur={focusEventHandler}
          onCompositionEnd={compositionEventHandler}
          onCompositionStart={compositionEventHandler}
          onCopy={clipboardEventHandler}
          onCut={clipboardEventHandler}
          onDrop={dragEventHandler}
          onKeyDown={keyboardEventHandler}
          onPaste={clipboardEventHandler}
        />
      </LocaleProvider>
    );
  },
);

if (process.env.NODE_ENV !== 'production') {
  XStarMdEditor.displayName = 'XStarMdEditor';
}

export default XStarMdEditor;

export const useMdEditorRef = () => useRef<XStarMdEditorHandle>(null);
