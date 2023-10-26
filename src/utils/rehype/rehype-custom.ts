import type { Root as HastRoot } from 'hast';
import { SKIP, visit } from 'unist-util-visit';

/**
 * 为 Custom 节点添加组件属性
 */
const rehypeCustom = (customBlocks: any) => (root: HastRoot) =>
  visit(root, { tagName: 'custom' }, (node) => {
    if (typeof node.properties?.meta === 'string') {
      node.properties.component = customBlocks[node.properties.meta] ?? 'div';
    }
    return SKIP;
  });

export default rehypeCustom;
