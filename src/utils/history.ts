import { useReducer } from 'react';
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

export interface DeleteAction {
  type: 'delete';
  payload?: {
    direction: 'backward' | 'forward';
    boundary: 'char' | 'line';
  };
  selection: ContainerSelection;
}

export interface ToggleAction {
  type: 'toggle';
  payload:
    | { type: 'heading'; depth: 1 | 2 | 3 | 4 | 5 | 6 }
    | {
        type:
          | 'thematicBreak'
          | 'blockquote'
          | 'code'
          | 'emphasis'
          | 'strong'
          | 'inlineCode'
          | 'delete'
          | 'math'
          | 'inlineMath';
      }
    | { type: 'link' | 'image'; url: string; description: string };
  selection: ContainerSelection;
}

export interface SetAction {
  type: 'set';
  payload: State;
  selection: ContainerSelection;
}

const stateReducer = (
  { sourceCode }: State,
  action: InsertAction | DeleteAction | ToggleAction | SetAction,
): State => {
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

    case 'delete': {
      // 选区不为空
      if (startOffset < endOffset) {
        return {
          sourceCode: `${before}${after}`,
          selection: createSelection(startOffset),
        };
      }

      // 选区为空，根据删除方向和边界生成新状态
      if (action.payload) {
        const { direction, boundary } = action.payload;

        if (direction === 'backward' && startOffset) {
          const index = before.lastIndexOf('\n');
          const length =
            boundary === 'char' || index === before.length - 1
              ? 1
              : before.length - 1 - index;
          return {
            sourceCode: `${before.slice(0, before.length - length)}${after}`,
            selection: createSelection(startOffset - length),
          };
        }

        if (direction === 'forward' && startOffset < sourceCode.length) {
          const index = `${after}\n`.indexOf('\n');
          const length = boundary === 'char' || !index ? 1 : index;
          return {
            sourceCode: `${before}${after.slice(length)}`,
            selection: createSelection(startOffset),
          };
        }
      }

      return { sourceCode, selection: action.selection };
    }

    case 'toggle': {
      const lineStartOffset = before.lastIndexOf('\n') + 1;
      const lineEndOffset = endOffset + `${after}\n`.indexOf('\n');
      const lineBefore = sourceCode.slice(0, lineStartOffset);
      const lineAfter = sourceCode.slice(lineEndOffset);

      switch (action.payload.type) {
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

        case 'thematicBreak': {
          return {
            sourceCode: `${sourceCode.slice(
              0,
              lineEndOffset,
            )}\n***\n${lineAfter}`,
            selection: createSelection(lineEndOffset + 5),
          };
        }

        case 'blockquote': {
          const lines = sourceCode
            .slice(lineStartOffset, lineEndOffset)
            .split('\n');
          const values = lines.map((line) => /^ {0,3}> */.test(line));
          for (let i = 0; i < values.length; i++) {
            if (values[i]) {
              lines[i] = lines[i].replace(/^ {0,3}> */, '');
            }
          }
          if (values.some((value) => !value)) {
            for (let i = 0; i < lines.length; i++) {
              lines[i] = `> ${lines[i]}`;
            }
          }
          const text = lines.join('\n');
          return {
            sourceCode: `${lineBefore}${text}${lineAfter}`,
            selection: createSelection(lineStartOffset + text.length),
          };
        }

        case 'code':
        case 'math': {
          const { type } = action.payload;
          const delimiter = type === 'code' ? '```' : '$$';
          return {
            sourceCode: `${sourceCode.slice(
              0,
              lineEndOffset,
            )}\n${delimiter}\n\n${delimiter}\n${lineAfter}`,
            selection: createSelection(lineEndOffset + delimiter.length + 2),
          };
        }

        case 'emphasis':
        case 'strong':
        case 'inlineCode':
        case 'delete':
        case 'inlineMath': {
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

        case 'link':
        case 'image': {
          const { type, url, description } = action.payload;
          return {
            sourceCode: `${before}${
              type === 'link' ? '' : '!'
            }[${description}](${url})${after}`,
            selection: createSelection(
              startOffset +
                url.length +
                description.length +
                4 +
                (type === 'link' ? 0 : 1),
            ),
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
  states: (State & { actionSelection: ContainerSelection })[];
  index: number;
  selection: ContainerSelection;
}

export interface UndoAction {
  type: 'undo';
}

export interface RedoAction {
  type: 'redo';
}

export interface SelectAction {
  type: 'select';
  selection: ContainerSelection;
}

const historyReducer = (
  { states, index, selection }: History,
  action:
    | UndoAction
    | RedoAction
    | SelectAction
    | InsertAction
    | DeleteAction
    | ToggleAction
    | SetAction,
): History => {
  switch (action.type) {
    case 'undo': {
      if (!index) {
        return { states, index, selection };
      }
      return {
        states,
        index: index - 1,
        selection: states[index].actionSelection,
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

    case 'select': {
      return { states, index, selection: action.selection };
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
      return {
        states: [
          ...states.slice(index < 32 ? 0 : index - 31, index + 1),
          { ...state, actionSelection: action.selection },
        ],
        index: index < 32 ? index + 1 : 32,
        selection: state.selection,
      };
    }
  }
};

export const useHistory = (initialSourceCode: string) => {
  const [history, dispatch] = useReducer(historyReducer, {
    states: [
      {
        sourceCode: initialSourceCode,
        selection: createSelection(0),
        actionSelection: createSelection(0),
      },
    ],
    index: 0,
    selection: createSelection(0),
  });

  return {
    sourceCode: history.states[history.index].sourceCode,
    selection: history.selection,
    dispatch,
  };
};
