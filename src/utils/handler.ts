import { createSelection, getRange } from './container';
import type {
  DeleteAction,
  InsertAction,
  SelectAction,
  SetAction,
  ToggleAction,
  useHistory,
} from './history';

/**
 * 处理函数上下文
 */
type HandlerContext = ReturnType<typeof useHistory>;

/**
 * 处理函数
 */
export interface Handler {
  (ctx: HandlerContext): void;
}

export const insertHandler =
  (payload: InsertAction['payload']): Handler =>
  ({ selection, dispatch }) =>
    dispatch({ type: 'insert', payload, selection });

export const deleteHandler =
  (payload: DeleteAction['payload']): Handler =>
  ({ selection, dispatch }) =>
    dispatch({ type: 'delete', payload, selection });

export const toggleHandler =
  (payload: ToggleAction['payload']): Handler =>
  ({ selection, dispatch }) =>
    dispatch({ type: 'toggle', payload, selection });

export const setHandler =
  (payload: SetAction['payload']): Handler =>
  ({ selection, dispatch }) =>
    dispatch({ type: 'set', payload, selection });

export const undoHandler =
  (): Handler =>
  ({ dispatch }) =>
    dispatch({ type: 'undo' });

export const redoHandler =
  (): Handler =>
  ({ dispatch }) =>
    dispatch({ type: 'redo' });

export const selectHandler =
  (selection: SelectAction['selection']): Handler =>
  ({ dispatch }) =>
    dispatch({ type: 'select', selection });

/**
 * 执行函数
 *
 * 接收一个处理函数，获取上下文后执行它
 */
export interface Executor {
  (handler: Handler): void;
}

/**
 * 键盘事件处理函数
 */
export interface KeyboardEventHandler {
  (ctx: HandlerContext & { e: React.KeyboardEvent }): void;
}

export const getDefaultKeyboardEventHandlers = (): KeyboardEventHandler[] => [
  // 处理 Enter 和 Tab
  ({ selection, dispatch, e }) => {
    if (
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      (e.key === 'Enter' || e.key === 'Tab')
    ) {
      e.preventDefault();
      dispatch({
        type: 'insert',
        payload: { text: e.key === 'Enter' ? '\n' : '\t' },
        selection,
      });
    }
  },

  // 处理 Backspace 和 Delete
  ({ selection, dispatch, e }) => {
    if (
      !e.altKey &&
      !e.metaKey &&
      (e.key === 'Backspace' || e.key === 'Delete')
    ) {
      e.preventDefault();
      dispatch({
        type: 'delete',
        payload: {
          direction: e.key === 'Backspace' ? 'backward' : 'forward',
          boundary: !e.ctrlKey ? 'char' : 'line',
        },
        selection,
      });
    }
  },

  // 处理斜体和粗体
  ({ selection, dispatch, e }) => {
    if (
      !e.altKey &&
      e.ctrlKey &&
      !e.metaKey &&
      (e.key === 'i' || e.key === 'b')
    ) {
      e.preventDefault();
      dispatch({
        type: 'toggle',
        payload: { type: e.key === 'i' ? 'emphasis' : 'strong' },
        selection,
      });
    }
  },

  // 处理撤销和恢复
  ({ dispatch, e }) => {
    if (
      !e.altKey &&
      e.ctrlKey &&
      !e.metaKey &&
      (e.key === 'z' || e.key === 'y')
    ) {
      e.preventDefault();
      dispatch({ type: e.key === 'z' ? 'undo' : 'redo' });
    }
  },

  // 处理左键和右键
  ({ sourceCode, selection, dispatch, e }) => {
    if (
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
    ) {
      e.preventDefault();
      const { anchorOffset, focusOffset } = selection;
      const { startOffset, endOffset } = getRange(selection);
      if (e.shiftKey) {
        if (e.key === 'ArrowLeft' && focusOffset) {
          dispatch({
            type: 'select',
            selection: createSelection(anchorOffset, focusOffset - 1),
          });
        } else if (e.key === 'ArrowRight' && focusOffset < sourceCode.length) {
          dispatch({
            type: 'select',
            selection: createSelection(anchorOffset, focusOffset + 1),
          });
        }
      } else {
        if (startOffset < endOffset) {
          dispatch({
            type: 'select',
            selection: createSelection(
              e.key === 'ArrowLeft' ? startOffset : endOffset,
            ),
          });
        } else if (e.key === 'ArrowLeft' && startOffset) {
          dispatch({
            type: 'select',
            selection: createSelection(startOffset - 1),
          });
        } else if (e.key === 'ArrowRight' && startOffset < sourceCode.length) {
          dispatch({
            type: 'select',
            selection: createSelection(startOffset + 1),
          });
        }
      }
    }
  },
];

/**
 * 组装处理函数
 *
 * @param handlers 处理函数数组
 * @returns 组装好的处理函数
 */
export const composeHandlers =
  <T>(handlers?: ((ctx: T) => void)[]) =>
  (ctx: T) => {
    if (handlers) {
      for (const handler of handlers) {
        handler(ctx);
      }
    }
    return ctx;
  };
