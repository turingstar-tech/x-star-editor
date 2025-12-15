import type { Root as HastRoot } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * 为 table 节点添加位置信息
 */
const rehypeTablePositions = () => (root: HastRoot) => {
  visit(root, 'element', (node: any) => {
    if (node.tagName === 'table') {
      if (node.position) {
        const startOffset = node.position?.start?.offset;
        const endOffset = node.position?.end?.offset;

        if (startOffset !== undefined && endOffset !== undefined) {
          // 确保 properties 存在
          if (!node.properties) {
            node.properties = {};
          }

          // 将位置信息添加到 table 元素的 properties 中
          node.properties['data-start'] = startOffset;
          node.properties['data-end'] = endOffset;
        }
      }
    }
  });
};

export default rehypeTablePositions;
