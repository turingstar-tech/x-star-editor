import type { RootContent as HastNode, Root as HastRoot } from 'hast';
import { EXIT, SKIP, visit } from 'unist-util-visit';

/**
 * 判断一个 Hast 节点是否属于行内代码或代码块
 *
 * @param node Hast 节点
 * @returns 是否属于行内代码或代码块
 */
const isCodeNode = (node: HastRoot | HastNode) =>
  node.type === 'element' && node.tagName === 'code';

/**
 * 判断一个 Hast 节点是否属于行内公式或公式块
 *
 * @param node Hast 节点
 * @returns 是否属于行内公式或公式块
 */
export const isMathNode = (node: HastRoot | HastNode) =>
  node.type === 'element' &&
  Array.isArray(node.properties?.className) &&
  node.properties?.className.includes('math');

/**
 * 解析文本中的公式
 *
 * @param text 文本
 * @returns Hast 节点
 */
const parseMath = (text: string) => {
  const result: HastNode[] = [];

  /**
   * 扫描文本
   */
  let scan = '';

  /**
   * 是否转义
   */
  let escape = false;

  /**
   * 连续 `$` 的数量
   */
  let level = 0;

  /**
   * 是否在行内公式中
   */
  let inline = false;

  /**
   * 是否在公式块中
   */
  let block = false;

  const push = () => {
    if (level === 1 && !block) {
      result.push(
        inline
          ? {
              type: 'element',
              tagName: 'span',
              properties: { className: ['math', 'math-inline'] },
              children: [{ type: 'text', value: scan }],
            }
          : { type: 'text', value: scan },
      );
      scan = '';
      inline = !inline;
    } else if (level === 2 && !inline) {
      result.push(
        block
          ? {
              type: 'element',
              tagName: 'div',
              properties: { className: ['math', 'math-display'] },
              children: [{ type: 'text', value: scan }],
            }
          : { type: 'text', value: scan },
      );
      scan = '';
      block = !block;
    } else if (level) {
      scan += '$'.repeat(level);
    }
    level = 0;
  };

  for (let i = 0; i <= text.length; i++) {
    const c = text[i] ?? '';
    if (escape) {
      if (c === '\\') {
        scan += c;
      } else {
        scan += c === '$' ? c : `\\${c}`;
        escape = false;
      }
    } else if (c === '$') {
      level++;
    } else {
      push();
      if (c === '\\') {
        escape = true;
      } else {
        scan += c;
      }
    }
  }

  if (scan) {
    result.push({ type: 'text', value: scan });
  }

  return result;
};

/**
 * 解析属于 Raw 节点的文本中的数学公式
 */
const rehypeMath = () => (root: HastRoot) => {
  let rawPositions: number[] = [];
  let i = 0;

  // 获取 rehype-raw-positions 记录的 Raw 节点的位置信息
  visit(
    root,
    { tagName: 'raw-positions' },
    (node, index, parent) => {
      if (typeof node.properties?.value === 'string') {
        rawPositions = node.properties.value.split(' ').map(Number);
      }
      if (index !== null && parent) {
        parent.children.splice(index);
      }
      return EXIT;
    },
    true,
  );

  if (rawPositions.length < 2) {
    return;
  }

  visit(root, (node, index, parent) => {
    if (isCodeNode(node) || isMathNode(node)) {
      return SKIP;
    }
    if (node.type === 'text' && index !== null && parent) {
      const startOffset = node.position?.start?.offset;
      if (startOffset === undefined) {
        return;
      }
      for (
        ;
        i < rawPositions.length - 1 && rawPositions[i + 1] <= startOffset;
        i += 2
      );
      if (i < rawPositions.length - 1 && rawPositions[i] <= startOffset) {
        const result = parseMath(node.value);
        parent.children.splice(index, 1, ...result);
        return index + result.length;
      }
    }
  });
};

export default rehypeMath;
