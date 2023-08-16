import { useEffect, useRef } from 'react';
import { editorRender } from './markdown';

/**
 * 容器选区，表示从锚点到焦点的文本
 */
export interface ContainerSelection {
  /**
   * 锚点偏移量
   */
  anchorOffset: number;

  /**
   * 焦点偏移量
   */
  focusOffset: number;
}

/**
 * 创建容器选区
 *
 * @param anchorOffset 锚点偏移量
 * @param focusOffset 焦点偏移量，默认与锚点偏移量相同
 * @returns 容器选区
 */
export const createSelection = (
  anchorOffset: number,
  focusOffset = anchorOffset,
): ContainerSelection => ({ anchorOffset, focusOffset });

/**
 * 根据容器选区获取容器范围
 *
 * @param selection 容器选区
 * @returns 容器范围
 */
export const getRange = ({
  anchorOffset,
  focusOffset,
}: ContainerSelection) => ({
  startOffset: anchorOffset < focusOffset ? anchorOffset : focusOffset,
  endOffset: anchorOffset < focusOffset ? focusOffset : anchorOffset,
});

/**
 * 获取一个可以设置文本和选区的容器
 *
 * @returns 容器
 */
export const useContainer = () => {
  /**
   * 容器挂载的 DOM 节点
   */
  const ref = useRef<HTMLDivElement>(null);

  /**
   * 将 DOM 树规范化
   *
   * 检查每个行节点的末尾是否为零宽空格，如果不是，则删除行中的零宽空格并在末尾添加零宽空格
   */
  const normalize = () => {
    if (!ref.current) {
      return;
    }

    const traverse = (node: Node, depth: number) => {
      if (depth === 2) {
        // 检查行节点的末尾
        if (node.lastChild?.nodeType === Node.TEXT_NODE) {
          if (node.lastChild.nodeValue?.endsWith('\u200B')) {
            return;
          }
        }
      } else if (depth > 2) {
        // 删除行中的零宽空格
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.nodeValue?.includes('\u200B')) {
            node.nodeValue = node.nodeValue.replace(/\u200B/g, '');
          }
          return;
        }
      }
      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i], depth + 1);
      }
      if (depth === 2) {
        // 添加零宽空格
        node.appendChild(document.createTextNode('\u200B'));
      }
    };

    traverse(ref.current, 0);
  };

  /**
   * 获取容器文本
   *
   * 在 DOM 树上遍历，将文本节点的值连接起来
   *
   * @returns 容器文本
   */
  const getText = () => {
    if (!ref.current) {
      return '';
    }

    let text = '';

    const traverse = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.nodeValue) {
          text += node.nodeValue;
        }
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          traverse(node.childNodes[i]);
        }
      }
    };

    traverse(ref.current);
    return text.slice(0, -1).replace(/\u200B/g, '\n');
  };

  /**
   * 设置容器文本
   *
   * 将文本映射到 DOM 树，用 diff 算法更新 DOM 树
   *
   * @param text 容器文本
   */
  const setText = (text: string) => {
    if (!ref.current) {
      return;
    }

    /**
     * 将一棵 DOM 树更新为另一棵 DOM 树
     *
     * @param newNode 新节点
     * @param oldNode 旧节点
     */
    const diff = (newNode: Node, oldNode: Node) => {
      let newChild = newNode.firstChild;
      let oldChild = oldNode.firstChild;

      // 依次更新子节点
      for (; newChild && oldChild; ) {
        const newNext = newChild.nextSibling;
        const oldNext = oldChild.nextSibling;
        if (newChild.nodeName !== oldChild.nodeName) {
          // 节点名称不同，直接替换
          oldChild.replaceWith(newChild);
        } else if (newChild.nodeType === Node.TEXT_NODE) {
          // 节点均为文本类型，更新文本内容
          if (newChild.nodeValue !== oldChild.nodeValue) {
            oldChild.nodeValue = newChild.nodeValue;
          }
        } else {
          // 节点名称相同，更新属性和子节点
          if (newChild instanceof Element && oldChild instanceof Element) {
            for (const oldAttrName of oldChild.getAttributeNames()) {
              if (!newChild.hasAttribute(oldAttrName)) {
                // 移除新节点没有的属性
                oldChild.removeAttribute(oldAttrName);
              }
            }
            for (const newAttrName of newChild.getAttributeNames()) {
              const newAttrValue = newChild.getAttribute(newAttrName);
              const oldAttrValue = oldChild.getAttribute(newAttrName);
              if (newAttrValue !== null && newAttrValue !== oldAttrValue) {
                oldChild.setAttribute(newAttrName, newAttrValue);
              }
            }
          }
          diff(newChild, oldChild);
        }
        newChild = newNext;
        oldChild = oldNext;
      }

      // 移除节点
      for (; oldChild; ) {
        const oldNext = oldChild.nextSibling;
        oldChild.remove();
        oldChild = oldNext;
      }

      // 添加节点
      for (; newChild; ) {
        const newNext = newChild.nextSibling;
        oldNode.appendChild(newChild);
        newChild = newNext;
      }
    };

    diff(editorRender(text), ref.current);
  };

  /**
   * 获取容器选区
   *
   * 用 Selection API 获取选中的 DOM 节点和节点内偏移量，在 DOM 树上遍历获取对应的容器内偏移量
   *
   * @returns 容器选区
   */
  const getSelection = () => {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode || !selection.focusNode) {
      return createSelection(-1);
    }

    /**
     * 根据节点和节点内偏移量获取容器内偏移量
     *
     * @param targetNode 节点
     * @param targetOffset 节点内偏移量
     * @returns 容器内偏移量
     */
    const getOffset = (targetNode: Node, targetOffset: number) => {
      if (!ref.current) {
        return -1;
      }

      let offset = 0;

      const traverse = (node: Node) => {
        if (node === targetNode) {
          if (node.nodeType === Node.TEXT_NODE) {
            if (node.nodeValue) {
              offset += targetOffset;
              if (
                targetOffset === node.nodeValue.length &&
                node.nodeValue.endsWith('\u200B')
              ) {
                offset--;
              }
            }
          } else {
            for (let i = 0; i < targetOffset; i++) {
              traverse(node.childNodes[i]);
            }
          }
          return true;
        }

        if (node.nodeType === Node.TEXT_NODE) {
          if (node.nodeValue) {
            offset += node.nodeValue.length;
          }
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            if (traverse(node.childNodes[i])) {
              return true;
            }
          }
        }
      };

      return traverse(ref.current) ? offset : -1;
    };

    return createSelection(
      getOffset(selection.anchorNode, selection.anchorOffset),
      getOffset(selection.focusNode, selection.focusOffset),
    );
  };

  /**
   * 设置容器选区
   *
   * 根据容器内偏移量，在 DOM 树上遍历获取对应的 DOM 节点和节点内偏移量，用 Selection API 选中
   *
   * @param selection 容器选区
   */
  const setSelection = ({ anchorOffset, focusOffset }: ContainerSelection) => {
    const selection = window.getSelection();
    if (!selection || anchorOffset === -1 || focusOffset === -1) {
      return;
    }

    /**
     * 根据容器内偏移量获取节点和节点内偏移量
     *
     * @param targetOffset 容器内偏移量
     * @returns 节点和节点内偏移量
     */
    const getNodeOffset = (targetOffset: number) => {
      if (!ref.current) {
        return { node: undefined, offset: 0 };
      }

      let offset = targetOffset;

      const traverse = (node: Node): Node | undefined => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.nodeValue) {
            if (
              offset < node.nodeValue.length ||
              (offset === node.nodeValue.length &&
                !node.nodeValue.endsWith('\u200B'))
            ) {
              return node;
            }
            offset -= node.nodeValue.length;
          }
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            const result = traverse(node.childNodes[i]);
            if (result) {
              return result;
            }
          }
        }
      };

      return { node: traverse(ref.current), offset };
    };

    const anchor = getNodeOffset(anchorOffset);
    const focus = getNodeOffset(focusOffset);
    if (!anchor.node || !focus.node) {
      return;
    }

    selection.setBaseAndExtent(
      anchor.node,
      anchor.offset,
      focus.node,
      focus.offset,
    );
  };

  // 容器选区改变后将光标滚动到视口内
  useEffect(() => {
    const listener = () => {
      const selection = window.getSelection();
      if (
        !selection ||
        !selection.focusNode ||
        !ref.current ||
        !ref.current.contains(selection.focusNode)
      ) {
        return;
      }

      const range = document.createRange();
      range.setStart(selection.focusNode, selection.focusOffset);
      range.setEnd(selection.focusNode, selection.focusOffset);

      const rangeRect = range.getBoundingClientRect();
      const containerRect = ref.current.getBoundingClientRect();
      const topOffset = rangeRect.top - containerRect.top;
      const bottomOffset = rangeRect.bottom - containerRect.bottom;
      if (topOffset < 10) {
        ref.current.scrollTop += topOffset - 10;
      } else if (bottomOffset > -10) {
        ref.current.scrollTop += bottomOffset + 10;
      }
    };

    document.addEventListener('selectionchange', listener, {
      capture: true,
      passive: true,
    });
    return () =>
      document.removeEventListener('selectionchange', listener, {
        capture: true,
      });
  }, []);

  return useRef({
    ref,
    normalize,
    getText,
    setText,
    getSelection,
    setSelection,
  }).current;
};
