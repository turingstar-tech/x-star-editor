import { createKeybindingsHandler } from 'tinykeys';
import { createSelection } from './container';
import type {
  BatchAction,
  InsertAction,
  MutateAction,
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
  (payload?: BatchAction['payload']): Handler =>
  ({ dispatch }) =>
    dispatch({ type: 'batch', payload });

export const mutateHandler =
  (payload: MutateAction['payload']): Handler =>
  ({ dispatch }) =>
    dispatch({ type: 'mutate', payload });

export const selectHandler =
  (payload: SelectAction['payload']): Handler =>
  ({ dispatch }) =>
    dispatch({ type: 'select', payload });

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

      ArrowRight: (e) => {
        const { anchorOffset, focusOffset } = selection;
        if (anchorOffset === focusOffset && sourceCode[focusOffset] === '\n') {
          e.preventDefault();
          dispatch({
            type: 'select',
            payload: { selection: createSelection(focusOffset + 1) },
          });
        }
      },

      'Shift+ArrowRight': (e) => {
        const { anchorOffset, focusOffset } = selection;
        if (sourceCode[focusOffset] === '\n') {
          e.preventDefault();
          dispatch({
            type: 'select',
            payload: {
              selection: createSelection(anchorOffset, focusOffset + 1),
            },
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
