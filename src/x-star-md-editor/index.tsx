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
   * 工具栏项
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
  getContainer: () => HTMLDivElement | null;
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
    const container = useContainer();
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
      () => ({ exec, getContainer: () => container.ref.current }),
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

    const compositionEndTimer = useRef<number>();

    const compositionEventHandler = (e: React.CompositionEvent) => {
      switch (e.type) {
        case 'compositionend': {
          if (compositionStartSelection.current) {
            dispatch({
              type: 'insert',
              payload: { text: e.data },
              selection: compositionStartSelection.current,
            });
            // 确保组合事件屏蔽表单和键盘事件
            compositionEndTimer.current = window.setTimeout(
              () => (compositionStartSelection.current = undefined),
            );
          }
          break;
        }

        case 'compositionstart': {
          window.clearTimeout(compositionEndTimer.current);
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
          window.setTimeout(() => {
            compositionStartSelection.current = undefined;
            container.setText(sourceCodeLatest.current);
          });
          break;
        }
      }
    };

    const formEventHandler = (e: React.FormEvent) => {
      if (compositionStartSelection.current) {
        e.preventDefault();
        return;
      }

      switch (e.type) {
        case 'beforeinput': {
          e.preventDefault();
          if ('data' in e && typeof e.data === 'string') {
            dispatch({
              type: 'insert',
              payload: { text: e.data },
              selection: getSelection(),
            });
          }
          break;
        }
      }
    };

    const options = useMemo(
      () =>
        composeHandlers(plugins)({
          toolbarItemMap: getDefaultToolbarItemMap(locale, onInsertFile),
          toolbarItems: getDefaultToolbarItems(),
          keyboardEventHandlers: getDefaultKeyboardEventHandlers(),
        }),
      [plugins],
    );

    const keyboardEventHandler = (e: React.KeyboardEvent) => {
      if (compositionStartSelection.current) {
        e.preventDefault();
        return;
      }

      switch (e.type) {
        case 'keydown': {
          composeHandlers(options.keyboardEventHandlers)({
            history,
            sourceCode,
            selection: getSelection(),
            dispatch,
            e,
          });
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
          ref={container.ref}
          className={classNames(`${prefix}md-editor`, className)}
          style={style}
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
