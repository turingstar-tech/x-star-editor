import { createKeybindingsHandler } from 'tinykeys';
import { createSelection, getRange } from './container';
import type {
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

export const batchHandler =
  (): Handler =>
  ({ dispatch }) =>
    dispatch({ type: 'batch' });

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
