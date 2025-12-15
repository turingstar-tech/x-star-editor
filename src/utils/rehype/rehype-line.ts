import type { Root as HastRoot } from 'hast';
import { SKIP, visit } from 'unist-util-visit';

/**
 * 为第一层 Hast 节点添加行号属性 (字符索引)
 */
const rehypeLine = () => (root: HastRoot) =>
  visit(root, 'element', (node) => {
    node.properties ??= {};
    // 记录行号，用于同步滚动
    node.properties['data-line'] = node.position?.start?.line;
    node.properties['data-start'] = node.position?.start?.offset;
    node.properties['data-end'] = node.position?.end?.offset;
    return SKIP;
  });

export default rehypeLine;
