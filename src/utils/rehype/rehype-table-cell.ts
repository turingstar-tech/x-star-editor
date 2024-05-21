import type { Root as HastRoot } from 'hast';
import { SKIP, visit } from 'unist-util-visit';

/**
 * 将单元格内的换行转成 `<br>`
 * 给 br、span 添加 tableCell 标识
 */
const rehypeTableCell = () => (root: HastRoot) =>
  visit(
    root,
    (node: any) =>
      'tagName' in node && (node.tagName === 'th' || node.tagName === 'td'),
    (node: any) => {
      const newChildren: {
        type: string;
        value: string;
        tagName?: string;
        tabelCell?: boolean;
      }[] = [];
      node.children.forEach(
        (child: {
          type: any;
          value: any;
          tagName: any;
          tabelCell?: boolean | undefined;
        }) => {
          if (child.type === 'text') {
            newChildren.push(
              ...child.value
                .split('\n')
                .map((text: string) => [
                  { type: 'text', value: text },
                  { type: 'element', tagName: 'br', tabelCell: true },
                ])
                .flat()
                .slice(0, -1),
            );
          } else if (
            node.children.length > 1 &&
            child.type === 'element' &&
            child.tagName === 'br'
          ) {
            newChildren.push({ ...child, tabelCell: true });
          } else if (child.type === 'element' && child.tagName === 'span') {
            newChildren.push({ ...child, tabelCell: true });
          } else {
            newChildren.push(child);
          }
        },
      );
      node.children = newChildren;
      return SKIP;
    },
  );

export default rehypeTableCell;
