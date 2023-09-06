import type { Root as HastRoot } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * 保存 Raw 节点的位置信息
 */
const rehypeRawPositions = () => (root: HastRoot) => {
  const rawPositions: number[] = [];

  visit(root, 'raw', (node) => {
    const startOffset = node.position?.start.offset;
    const endOffset = node.position?.end.offset;
    if (startOffset === undefined || endOffset === undefined) {
      return;
    }
    rawPositions.push(startOffset, endOffset);
  });

  // 记录在新的 Hast 节点上，防止被 rehype-raw 删除
  root.children.push({
    type: 'element',
    tagName: 'raw-positions',
    properties: { value: rawPositions.join(' ') },
    children: [],
  });
};

export default rehypeRawPositions;
