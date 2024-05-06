import { useReducer, useRef } from 'react';
import type { ContainerSelection } from './container';
import { createSelection, getRange } from './container';

/**
 * 编辑器状态
 */
interface State {
  sourceCode: string;
  selection: ContainerSelection;
}

export interface InsertAction {
  type: 'insert';
  payload: { text: string };
  selection: ContainerSelection;
}

export interface ToggleAction {
  type: 'toggle';
  payload:
    | {
        type:
          | 'blockquote'
          | 'delete'
          | 'emphasis'
          | 'inlineCode'
          | 'inlineMath'
          | 'math'
          | 'orderedList'
          | 'strong'
          | 'taskList'
          | 'thematicBreak'
          | 'unorderedList';
      }
    | { type: 'code'; lang: string; value: string; showLineNumbers: boolean }
    | { type: 'heading'; depth: 1 | 2 | 3 | 4 | 5 | 6 }
    | { type: 'image' | 'link'; url: string; description: string }
    | { type: 'table'; row?: number; col?: number };
  selection: ContainerSelection;
}

export interface SetAction {
  type: 'set';
  payload: State;
  selection: ContainerSelection;
}

type StateAction = InsertAction | ToggleAction | SetAction;

const stateReducer = ({ sourceCode }: State, action: StateAction): State => {
  const { anchorOffset, focusOffset } = action.selection;
  const { startOffset, endOffset } = getRange(action.selection);
  const before = sourceCode.slice(0, startOffset);
  const after = sourceCode.slice(endOffset);

  switch (action.type) {
    case 'insert': {
      const text = action.payload.text.replace(/\r\n?/g, '\n');
      return {
        sourceCode: `${before}${text}${after}`,
        selection: createSelection(startOffset + text.length),
      };
    }

    case 'toggle': {
      const lineStartOffset = before.lastIndexOf('\n') + 1;
      const lineEndOffset = endOffset + `${after}\n`.indexOf('\n');
      const lineBefore = sourceCode.slice(0, lineStartOffset);
      const lineAfter = sourceCode.slice(lineEndOffset);

      switch (action.payload.type) {
        case 'blockquote':
        case 'orderedList':
        case 'taskList':
        case 'unorderedList': {
          const { type } = action.payload;
          const prefixes =
            type === 'blockquote'
              ? ['>', '>']
              : type === 'orderedList'
              ? ['\\d+\\.', '1.']
              : type === 'taskList'
              ? ['[*+-] \\[[ x]]', '* [ ]']
              : ['[*+-]', '*'];
          const lines = sourceCode
            .slice(lineStartOffset, lineEndOffset)
            .split('\n');
          const values = lines.map((line) =>
            new RegExp(`^ {0,3}${prefixes[0]} +`).test(line),
          );
          for (let i = 0; i < values.length; i++) {
            if (values[i]) {
              lines[i] = lines[i].replace(
                new RegExp(`^ {0,3}${prefixes[0]} +`),
                '',
              );
            }
          }
          if (values.some((value) => !value)) {
            for (let i = 0; i < lines.length; i++) {
              lines[i] = `${prefixes[1]} ${lines[i]}`;
            }
          }
          const text = lines.join('\n');
          return {
            sourceCode: `${lineBefore}${text}${lineAfter}`,
            selection: createSelection(lineStartOffset + text.length),
          };
        }

        case 'code': {
          const { lang, value, showLineNumbers } = action.payload;
          const startOffset =
            lineEndOffset + lang.length + (showLineNumbers ? 21 : 5);
          return {
            sourceCode: `${sourceCode.slice(0, lineEndOffset)}\n\`\`\`${lang}${
              showLineNumbers ? ' showLineNumbers' : ''
            }\n${value}\n\`\`\`\n${lineAfter}`,
            selection: createSelection(startOffset, startOffset + value.length),
          };
        }

        case 'delete':
        case 'emphasis':
        case 'inlineCode':
        case 'inlineMath':
        case 'strong': {
          const { type } = action.payload;
          const delimiters =
            type === 'emphasis'
              ? ['*', '_']
              : type === 'strong'
              ? ['**', '__']
              : type === 'inlineCode'
              ? ['`']
              : type === 'delete'
              ? ['~~']
              : ['$'];
          const text = sourceCode.slice(startOffset, endOffset);
          for (const delimiter of delimiters) {
            if (before.endsWith(delimiter) && after.startsWith(delimiter)) {
              // 删除分隔文本
              return {
                sourceCode: `${before.slice(
                  0,
                  before.length - delimiter.length,
                )}${text}${after.slice(delimiter.length)}`,
                selection: createSelection(
                  anchorOffset - delimiter.length,
                  focusOffset - delimiter.length,
                ),
              };
            }
          }
          const delimiter = delimiters[0];
          // 插入分隔文本
          return {
            sourceCode: `${before}${delimiter}${text}${delimiter}${after}`,
            selection: createSelection(
              anchorOffset + delimiter.length,
              focusOffset + delimiter.length,
            ),
          };
        }

        case 'heading': {
          const { depth } = action.payload;
          const lines = sourceCode
            .slice(lineStartOffset, lineEndOffset)
            .split('\n');
          const values = lines.map((line) =>
            [1, 2, 3, 4, 5, 6].find((value) =>
              new RegExp(`^ {0,3}#{${value}} +`).test(line),
            ),
          );
          for (let i = 0; i < values.length; i++) {
            const value = values[i];
            if (value) {
              lines[i] = lines[i].replace(
                new RegExp(`^ {0,3}#{${value}} +`),
                '',
              );
            }
          }
          if (values.some((value) => value !== depth)) {
            for (let i = 0; i < lines.length; i++) {
              lines[i] = `${'#'.repeat(depth)} ${lines[i]}`;
            }
          }
          const text = lines.join('\n');
          return {
            sourceCode: `${lineBefore}${text}${lineAfter}`,
            selection: createSelection(lineStartOffset + text.length),
          };
        }

        case 'image':
        case 'link': {
          const { type, url, description } = action.payload;
          return {
            sourceCode: `${before}${
              type === 'image' ? '!' : ''
            }[${description}](${url})${after}`,
            selection: createSelection(
              startOffset +
                url.length +
                description.length +
                4 +
                (type === 'image' ? 1 : 0),
            ),
          };
        }

        case 'math': {
          return {
            sourceCode: `${sourceCode.slice(
              0,
              lineEndOffset,
            )}\n$$\n\n$$\n${lineAfter}`,
            selection: createSelection(lineEndOffset + 4),
          };
        }

        case 'table': {
          const { row = 3, col = 2 } = action.payload;
          const header = `\n${'|  '.repeat(col)}|\n${'| - '.repeat(col)}|\n`;
          const content = `${'|  '.repeat(col)}|\n`.repeat(row - 1);
          const tableCode = header + content;
          return {
            sourceCode: `${sourceCode.slice(
              0,
              lineEndOffset,
            )}${tableCode}${lineAfter}`,
            selection: createSelection(lineEndOffset + row),
          };
        }

        case 'thematicBreak': {
          return {
            sourceCode: `${sourceCode.slice(
              0,
              lineEndOffset,
            )}\n***\n${lineAfter}`,
            selection: createSelection(lineEndOffset + 5),
          };
        }

        default: {
          const _: never = action.payload;
          return _;
        }
      }
    }

    case 'set': {
      const { sourceCode, selection } = action.payload;
      return { sourceCode: sourceCode.replace(/\r\n?/g, '\n'), selection };
    }

    default: {
      const _: never = action;
      return _;
    }
  }
};

/**
 * 编辑器历史
 */
interface History {
  states: (State & { action: StateAction & { batch?: boolean } })[];
  index: number;
  selection: ContainerSelection;
}
export interface UndoAction {
  type: 'undo';
}

export interface RedoAction {
  type: 'redo';
}

export interface BatchAction {
  type: 'batch';
  payload?: { selection: ContainerSelection };
}

export interface MutateAction {
  type: 'mutate';
  payload: { sourceCode: string };
}

export interface SelectAction {
  type: 'select';
  payload: { selection: ContainerSelection };
}

type HistoryAction =
  | UndoAction
  | RedoAction
  | BatchAction
  | MutateAction
  | SelectAction;

const historyReducer = (
  { states, index, selection }: History,
  action: HistoryAction | (StateAction & { batch?: boolean }),
): History => {
  switch (action.type) {
    case 'undo': {
      if (!index) {
        return { states, index, selection };
      }
      return {
        states,
        index: index - 1,
        selection: states[index].action.selection,
      };
    }

    case 'redo': {
      if (index === states.length - 1) {
        return { states, index, selection };
      }
      return {
        states,
        index: index + 1,
        selection: states[index + 1].selection,
      };
    }

    case 'batch': {
      return {
        states: [
          ...states.slice(0, index),
          {
            ...states[index],
            selection: action.payload?.selection ?? states[index].selection,
            action: { ...states[index].action, batch: false },
          },
        ],
        index,
        selection: action.payload?.selection ?? selection,
      };
    }

    case 'mutate': {
      return {
        states: [
          ...states.slice(0, index),
          { ...states[index], sourceCode: action.payload.sourceCode },
          ...states.slice(index + 1),
        ],
        index,
        selection,
      };
    }

    case 'select': {
      return { states, index, selection: action.payload.selection };
    }

    default: {
      const state = stateReducer(states[index], action);
      // 只有源代码或选区改变时才记录历史
      if (
        state.sourceCode === states[index].sourceCode &&
        state.selection === action.selection
      ) {
        return { states, index, selection };
      }
      if (states[index].action.batch && action.batch) {
        return {
          states: [...states.slice(0, index), { ...states[index], ...state }],
          index,
          selection: state.selection,
        };
      }
      return {
        states: [
          ...states.slice(index < 100 ? 0 : index - 99, index),
          {
            ...states[index],
            action: { ...states[index].action, batch: false },
          },
          { ...state, action },
        ],
        index: index < 100 ? index + 1 : 100,
        selection: state.selection,
      };
    }
  }
};

export const useHistory = (initialSourceCode: string, readOnly?: boolean) => {
  const [history, dispatch] = useReducer<typeof historyReducer, string>(
    historyReducer,
    initialSourceCode,
    (text) => {
      const action: InsertAction = {
        type: 'insert',
        payload: { text },
        selection: createSelection(0),
      };
      const state = stateReducer(
        { sourceCode: '', selection: createSelection(0) },
        action,
      );
      return {
        states: [{ ...state, action }],
        index: 0,
        selection: state.selection,
      };
    },
  );

  const readOnlyLatest = useRef(readOnly);
  readOnlyLatest.current = readOnly;

  return {
    history,
    sourceCode: history.states[history.index].sourceCode,
    selection: history.selection,
    dispatch: useRef<typeof dispatch>((action) => {
      if (!readOnlyLatest.current) {
        dispatch(action);
      }
    }).current,
  };
};
