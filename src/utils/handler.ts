import { createKeybindingsHandler } from 'tinykeys';
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
export interface Handler<T = void> {
  (ctx: HandlerContext): T;
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
  <T>(handler: Handler<T>): T;
}

/**
 * 键盘事件处理函数
 */
export interface KeyboardEventHandler {
  (ctx: HandlerContext & { e: React.KeyboardEvent }): void;
}

export const getDefaultKeyboardEventHandlers = (): KeyboardEventHandler[] => [
  ({ sourceCode, selection, dispatch, e }) =>
    createKeybindingsHandler({
      Tab: (e) => {
        e.preventDefault();
        dispatch({ type: 'insert', payload: { text: '\t' }, selection });
      },

      Backspace: (e) => {
        e.preventDefault();
        dispatch({
          type: 'delete',
          payload: { direction: 'backward', boundary: 'char' },
          selection,
        });
      },

      '$mod+Backspace': (e) => {
        e.preventDefault();
        dispatch({
          type: 'delete',
          payload: { direction: 'backward', boundary: 'line' },
          selection,
        });
      },

      'Shift+Backspace': (e) => {
        e.preventDefault();
        dispatch({
          type: 'delete',
          payload: { direction: 'backward', boundary: 'char' },
          selection,
        });
      },

      'Meta+Backspace': (e) => e.preventDefault(),
      'Alt+Backspace': (e) => e.preventDefault(),
      'Control+Backspace': (e) => e.preventDefault(),
      'Shift+Meta+Backspace': (e) => e.preventDefault(),
      'Shift+Alt+Backspace': (e) => e.preventDefault(),
      'Shift+Control+Backspace': (e) => e.preventDefault(),
      'Meta+Alt+Backspace': (e) => e.preventDefault(),
      'Meta+Control+Backspace': (e) => e.preventDefault(),
      'Alt+Control+Backspace': (e) => e.preventDefault(),
      'Shift+Meta+Alt+Backspace': (e) => e.preventDefault(),
      'Shift+Meta+Control+Backspace': (e) => e.preventDefault(),
      'Shift+Alt+Control+Backspace': (e) => e.preventDefault(),
      'Meta+Alt+Control+Backspace': (e) => e.preventDefault(),

      Delete: (e) => {
        e.preventDefault();
        dispatch({
          type: 'delete',
          payload: { direction: 'forward', boundary: 'char' },
          selection,
        });
      },

      '$mod+Delete': (e) => {
        e.preventDefault();
        dispatch({
          type: 'delete',
          payload: { direction: 'forward', boundary: 'line' },
          selection,
        });
      },

      'Shift+Delete': (e) => {
        e.preventDefault();
        dispatch({
          type: 'delete',
          payload: { direction: 'forward', boundary: 'char' },
          selection,
        });
      },

      'Meta+Delete': (e) => e.preventDefault(),
      'Alt+Delete': (e) => e.preventDefault(),
      'Control+Delete': (e) => e.preventDefault(),
      'Shift+Meta+Delete': (e) => e.preventDefault(),
      'Shift+Alt+Delete': (e) => e.preventDefault(),
      'Shift+Control+Delete': (e) => e.preventDefault(),
      'Meta+Alt+Delete': (e) => e.preventDefault(),
      'Meta+Control+Delete': (e) => e.preventDefault(),
      'Alt+Control+Delete': (e) => e.preventDefault(),
      'Shift+Meta+Alt+Delete': (e) => e.preventDefault(),
      'Shift+Meta+Control+Delete': (e) => e.preventDefault(),
      'Shift+Alt+Control+Delete': (e) => e.preventDefault(),
      'Meta+Alt+Control+Delete': (e) => e.preventDefault(),

      '$mod+KeyI': (e) => {
        e.preventDefault();
        dispatch({ type: 'toggle', payload: { type: 'emphasis' }, selection });
      },

      '$mod+KeyB': (e) => {
        e.preventDefault();
        dispatch({ type: 'toggle', payload: { type: 'strong' }, selection });
      },

      '$mod+KeyZ': (e) => {
        e.preventDefault();
        dispatch({ type: 'undo' });
      },

      '$mod+KeyY': (e) => {
        e.preventDefault();
        dispatch({ type: 'redo' });
      },

      ArrowLeft: (e) => {
        e.preventDefault();
        const { startOffset, endOffset } = getRange(selection);
        if (startOffset < endOffset) {
          dispatch({ type: 'select', selection: createSelection(startOffset) });
        } else if (startOffset) {
          dispatch({
            type: 'select',
            selection: createSelection(startOffset - 1),
          });
        }
      },

      'Shift+ArrowLeft': (e) => {
        e.preventDefault();
        const { anchorOffset, focusOffset } = selection;
        if (focusOffset) {
          dispatch({
            type: 'select',
            selection: createSelection(anchorOffset, focusOffset - 1),
          });
        }
      },

      ArrowRight: (e) => {
        e.preventDefault();
        const { startOffset, endOffset } = getRange(selection);
        if (startOffset < endOffset) {
          dispatch({ type: 'select', selection: createSelection(endOffset) });
        } else if (startOffset < sourceCode.length) {
          dispatch({
            type: 'select',
            selection: createSelection(startOffset + 1),
          });
        }
      },

      'Shift+ArrowRight': (e) => {
        e.preventDefault();
        const { anchorOffset, focusOffset } = selection;
        if (focusOffset < sourceCode.length) {
          dispatch({
            type: 'select',
            selection: createSelection(anchorOffset, focusOffset + 1),
          });
        }
      },
    })(e.nativeEvent),
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
