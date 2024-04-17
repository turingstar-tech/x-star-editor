import classNames from 'classnames';
import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { ToolbarItemMap, ToolbarItems } from '../components/Toolbar';
import Toolbar, {
  getDefaultToolbarItemMap,
  getDefaultToolbarItems,
} from '../components/Toolbar';
import { LocaleProvider } from '../locales';
import { createSelection, getRange, useContainer } from '../utils/container';
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
  getValue: () => string;
  setValue: (value: string) => void;
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
   * 配置未输入时的提示语
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
  readOnly?: boolean;

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
      placeholder,
      initialValue = '',
      value,
      readOnly,
      plugins,
      onChange,
      onInsertFile,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const container = useContainer(containerRef);

    const { history, sourceCode, selection, dispatch } = useHistory(
      value ?? initialValue,
      readOnly,
    );

    const ignoreNext = useRef(false);
    const initialized = useRef(false);

    // 将文本同步到容器
    useEffect(() => {
      if (!ignoreNext.current) {
        container.setText(sourceCode);
      }
      if (initialized.current) {
        onChange?.(sourceCode);
      }
    }, [sourceCode]);

    // 将选区同步到容器
    useEffect(() => {
      if (!ignoreNext.current && initialized.current) {
        container.setSelection(selection);
      }
    }, [selection]);

    useEffect(() => {
      ignoreNext.current = false;
      initialized.current = true;
    }, [sourceCode, selection]);

    // 受控时将内部文本与外部文本同步
    useEffect(() => {
      if (value !== undefined && sourceCode !== value) {
        // 不触发 onChange 事件
        initialized.current = false;
        dispatch({ type: 'mutate', payload: { sourceCode: value } });
      }
    }, [value]);

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
      () => ({
        exec,
        getEditorContainer: () => containerRef.current!,
        getValue: () => sourceCodeLatest.current,
        setValue: (value: string) => {
          const selection = getSelection();
          dispatch({
            type: 'set',
            payload: { sourceCode: value, selection },
            selection,
          });
        },
      }),
      [],
    );

    const clipboardEventHandler = (e: React.ClipboardEvent) => {
      const selection = getSelection();
      const { startOffset, endOffset } = getRange(selection);

      switch (e.type) {
        case 'copy':
        case 'cut': {
          // 防止传输其他类型数据
          e.preventDefault();
          if (startOffset < endOffset) {
            e.clipboardData.setData(
              'text/plain',
              sourceCode.slice(startOffset, endOffset),
            );
            if (e.type === 'cut') {
              dispatch({ type: 'insert', payload: { text: '' }, selection });
            }
          }
          break;
        }
      }
    };

    const compositionEventHandler = (e: React.CompositionEvent) => {
      switch (e.type) {
        case 'compositionend': {
          // 组合时不更新 DOM，组合结束统一更新
          const selection = getSelection();
          container.setText(sourceCodeLatest.current);
          container.setSelection(selection);
          dispatch({ type: 'batch' });
          break;
        }
      }
    };

    const dragEventHandler = (e: React.DragEvent) => {
      const selection = getSelection();
      const { startOffset, endOffset } = getRange(selection);

      switch (e.type) {
        case 'dragstart': {
          if (startOffset < endOffset) {
            // 防止传输其他类型数据
            e.dataTransfer.clearData();
            e.dataTransfer.setData(
              'text/plain',
              sourceCode.slice(startOffset, endOffset),
            );
          }
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
          // 组合时不触发快捷键
          if (!e.nativeEvent.isComposing) {
            container.normalizeSelection();
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

    useEffect(() => {
      const editor = containerRef.current;
      if (!editor) {
        return;
      }

      const listener = (e: InputEvent) => {
        const targetRange =
          e.getTargetRanges()[0] ?? window.getSelection()?.getRangeAt(0);
        if (!targetRange) {
          return;
        }

        const startOffset = container.getOffset(
          editor,
          targetRange.startContainer,
          targetRange.startOffset,
        );
        const endOffset = container.getOffset(
          editor,
          targetRange.endContainer,
          targetRange.endOffset,
        );
        const selection = createSelection(startOffset, endOffset);

        switch (e.inputType) {
          case 'insertText': {
            e.preventDefault();
            if (e.data !== null) {
              dispatch({
                type: 'insert',
                payload: { text: e.data },
                selection,
              });
            }
            break;
          }

          case 'insertReplacementText':
          case 'insertFromDrop':
          case 'insertFromPaste': {
            e.preventDefault();
            if (e.dataTransfer?.types.includes('text/plain')) {
              dispatch({
                type: 'insert',
                payload: { text: e.dataTransfer.getData('text/plain') },
                selection,
                batch: true,
              });
              dispatch({ type: 'batch' });
            } else if (e.dataTransfer?.types.includes('Files')) {
              const file = e.dataTransfer.files[0];
              onInsertFile?.(file, {
                description: file.name,
                image: file.type.startsWith('image/'),
              });
            }
            break;
          }

          case 'insertLineBreak':
          case 'insertParagraph': {
            e.preventDefault();
            dispatch({
              type: 'insert',
              payload: { text: '\n' },
              selection,
            });
            break;
          }

          case 'insertCompositionText':
          case 'insertFromComposition': {
            // 避免 DOM 更新扰乱组合
            ignoreNext.current = true;
            if (e.data !== null) {
              dispatch({
                type: 'insert',
                payload: { text: e.data },
                selection,
                batch: true,
              });
            }
            break;
          }

          case 'deleteWordBackward':
          case 'deleteWordForward':
          case 'deleteContentBackward':
          case 'deleteContentForward': {
            e.preventDefault();
            if (startOffset < endOffset) {
              dispatch({
                type: 'insert',
                payload: { text: '' },
                selection,
              });
            } else if (e.inputType.endsWith('Backward')) {
              if (startOffset) {
                dispatch({
                  type: 'insert',
                  payload: { text: '' },
                  selection: createSelection(startOffset - 1, endOffset),
                });
              }
            } else {
              if (endOffset < sourceCodeLatest.current.length) {
                dispatch({
                  type: 'insert',
                  payload: { text: '' },
                  selection: createSelection(startOffset, endOffset + 1),
                });
              }
            }
            break;
          }

          case 'deleteByDrag':
          case 'deleteCompositionText': {
            ignoreNext.current = true;
            dispatch({
              type: 'insert',
              payload: { text: '' },
              selection,
              batch: true,
            });
            break;
          }

          case 'formatBold': {
            e.preventDefault();
            dispatch({
              type: 'toggle',
              payload: { type: 'strong' },
              selection,
            });
            break;
          }

          case 'formatItalic': {
            e.preventDefault();
            dispatch({
              type: 'toggle',
              payload: { type: 'emphasis' },
              selection,
            });
            break;
          }

          default: {
            e.preventDefault();
            break;
          }
        }
      };

      editor.addEventListener('beforeinput', listener);
      return () => editor.removeEventListener('beforeinput', listener);
    }, []);

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
          className={classNames(
            `${prefix}-md-editor`,
            { [`${prefix}-empty`]: !sourceCode },
            className,
          )}
          style={{ ...style, height }}
          placeholder={placeholder}
          contentEditable
          onBlur={focusEventHandler}
          onCompositionEnd={compositionEventHandler}
          onCopy={clipboardEventHandler}
          onCut={clipboardEventHandler}
          onDragStart={dragEventHandler}
          onKeyDown={keyboardEventHandler}
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
