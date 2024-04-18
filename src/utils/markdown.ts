import type { Root as HastRoot } from 'hast';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { toText as hastToText } from 'hast-util-to-text';
import type {
  Image as MdastImage,
  Content as MdastNode,
  Root as MdastRoot,
} from 'mdast';
import type { Math as MdastMath } from 'mdast-util-math';
import type { Options as ToStringOptions } from 'mdast-util-to-string';
import { toString as mdastToString } from 'mdast-util-to-string';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import rehypeKatex from 'rehype-katex';
import rehypeMermaid from 'rehype-mermaidjs';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import rehypeRemark, { defaultHandlers } from 'rehype-remark';
import { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import type { ViewerOptions } from '../x-star-md-viewer';
import { prefix } from './global';
import rehypeCustom from './rehype/rehype-custom';
import rehypeMath, { isMathNode } from './rehype/rehype-math';
import rehypeRawPositions from './rehype/rehype-raw-positions';

/**
 * 将 Markdown 文本解析为 Mdast 树的处理器
 */
const toMdastProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .freeze();

/**
 * 带缓存的解析函数
 *
 * @param sourceCode Markdown 文本
 * @returns Mdast 树
 */
const cachedParse = (() => {
  let cache: Record<string, MdastRoot> = {};
  return (sourceCode: string) =>
    cache[sourceCode] ??
    (cache = { [sourceCode]: toMdastProcessor.parse(sourceCode) })[sourceCode];
})();

/**
 * 将 Markdown 文本映射到 DOM 树，第一层为 `<div>` 块元素，第二层为 `<div>` 行元素，之后均为 `<span>` 元素
 *
 * @param sourceCode Markdown 文本
 * @returns DOM 树
 */
export const editorRender = (sourceCode: string) => {
  /**
   * CSS 类名前缀
   */
  const mdPrefix = `${prefix}-md`;

  /**
   * 扫描偏移量，表示已经添加到 DOM 树的文本
   */
  let scanOffset = 0;

  /**
   * 遍历 Mdast 树时的栈，保存 Mdast 节点、对应的 DOM 元素、为第几个子元素
   */
  const stack: { node: MdastNode; element: HTMLElement; counter: number }[] =
    [];

  /**
   * 块级元素
   */
  let block = document.createElement('div');

  /**
   * DOM 树根元素
   */
  const root = document.createElement('div');

  /**
   * 判断一个 Mdast 节点的子节点是否为流内容
   *
   * @param node Mdast 节点
   * @returns 子节点是否为流内容
   */
  const isFlowContent = (node: MdastNode) =>
    node.type === 'blockquote' ||
    node.type === 'footnoteDefinition' ||
    node.type === 'listItem';

  /**
   * 将栈中指定索引的 DOM 元素推到对应的父元素中
   *
   * @param index 索引
   */
  const pushElement = (index: number) => {
    const { node } = stack[index];

    // 如果节点为流内容，则将样式添加到该行的 `<div>` 元素上，否则添加到该节点的元素上
    const styleElement =
      stack[index && !isFlowContent(stack[index - 1].node) ? index : 0].element;
    styleElement.classList.add(`${mdPrefix}-${node.type}`);
    if (node.type === 'heading') {
      styleElement.classList.add(`${mdPrefix}-heading-${node.depth}`);
    }

    // 如果索引为 0，则父节点为块级元素，否则为前一个索引的 DOM 元素
    const parentElement = index ? stack[index - 1].element : block;
    parentElement.append(stack[index].element);
    stack[index].element = document.createElement(index ? 'span' : 'div');
    stack[index].counter++;
  };

  /**
   * 将块级元素推到 DOM 树根元素中
   */
  const pushBlock = () => {
    root.append(block);
    block = document.createElement('div');
  };

  /**
   * 创建分隔文本元素
   *
   * @param text 文本
   * @returns `<span>` 元素
   */
  const createDelimiter = (text: string) => {
    const temp = document.createElement('span');
    temp.append(text);
    temp.classList.add(`${mdPrefix}-delimiter`);
    return temp;
  };

  /**
   * 创建行元素
   *
   * @param text 文本
   * @returns `<div>` 元素
   */
  const createLine = (text: string) => {
    const temp = document.createElement('div');
    temp.append(`${text}\u200B`);
    return temp;
  };

  /**
   * 添加文本到 DOM 树
   *
   * @param text 文本
   * @param delimiter 是否为分隔文本，默认为 `false`
   */
  const addText = (text: string, delimiter = false) => {
    // 每行文本放在不同 `<div>` 元素中
    const lines = text.split('\n');
    if (stack.length) {
      // 如果栈不为空，说明为块级元素内的文本，每一行都应推到块级元素中
      if (lines[0]) {
        stack
          .at(-1)!
          .element.append(delimiter ? createDelimiter(lines[0]) : lines[0]);
      }
      for (let i = 1; i < lines.length; i++) {
        for (let j = stack.length - 1; j; j--) {
          pushElement(j);
        }
        stack[0].element.append('\u200B');
        pushElement(0);
        if (lines[i]) {
          stack
            .at(-1)!
            .element.append(delimiter ? createDelimiter(lines[i]) : lines[i]);
        }
      }
      scanOffset += text.length;
    } else {
      // 如果栈为空，说明为块级元素间的文本，最后一行应视为下一块级元素内的文本
      for (let i = 0; i < lines.length - 1; i++) {
        block.append(createLine(lines[i]));
        pushBlock();
        scanOffset += lines[i].length + 1;
      }
    }
  };

  /**
   * 根据 Mdast 节点生成对应的 DOM 子元素
   *
   * @param nodes Mdast 节点
   * @param parentEndOffset 父节点终点偏移量
   */
  const getChildren = (nodes: MdastNode[], parentEndOffset: number) => {
    for (const node of nodes) {
      let startOffset = node.position?.start?.offset;
      const endOffset = node.position?.end?.offset;
      if (startOffset === undefined || endOffset === undefined) {
        continue;
      }
      // 由于 unified 的问题，起点偏移量可能小于扫描偏移量，应修正
      if (startOffset < scanOffset) {
        startOffset = scanOffset;
      }
      // 如果起点偏移量大于等于终点偏移量，则不用添加任何文本
      if (startOffset >= endOffset) {
        continue;
      }

      // 添加扫描偏移量与起点偏移量间的分隔文本
      addText(sourceCode.slice(scanOffset, startOffset), true);

      // 为 Mdast 节点创建 DOM 元素
      stack.push({
        node,
        element: document.createElement(stack.length ? 'span' : 'div'),
        counter: 0,
      });

      if ('children' in node) {
        getChildren(node.children, endOffset);
      } else {
        addText(sourceCode.slice(scanOffset, endOffset));
      }

      if (stack.length > 1) {
        pushElement(stack.length - 1);
      } else {
        // 如果栈大小为 1，说明为块级元素终点
        stack[0].element.append('\u200B');
        pushElement(0);
        // 记录行号，用于同步滚动
        block.dataset.line = `${node.position?.start?.line}`;
        pushBlock();
        scanOffset++;
      }
      stack.pop();
    }

    // 添加扫描偏移量与父节点终点偏移量间的分隔文本
    addText(sourceCode.slice(scanOffset, parentEndOffset), true);
  };

  getChildren(cachedParse(sourceCode).children, sourceCode.length);

  if (scanOffset <= sourceCode.length) {
    // 添加最后一行文本
    block.append(createLine(sourceCode.slice(scanOffset)));
    pushBlock();
  }

  return root;
};

/**
 * 将 Mdast 树转成 Hast 树的处理器
 */
const toHastProcessor = unified()
  .use(remarkBreaks)
  .use(remarkRehype, {
    allowDangerousHtml: true,
    handlers: {
      math: (h, node: MdastMath) =>
        // 如果 Math 节点的 `meta` 属性不为空，则视为自定义块
        node.meta
          ? h(node.position, 'custom', { meta: node.meta, value: node.value })
          : h(node, 'div'),
      image: (h, node: MdastImage) => {
        try {
          const alts: string[] = [];
          const styles: string[] = [];
          node.alt?.split(' ').forEach((word) => {
            const s = word.split(':');
            if (s.length !== 2) {
              alts.push(word);
            } else {
              if (s[0] === 'w') {
                s[0] = 'width';
              } else if (s[0] === 'h') {
                s[0] = 'height';
              }
              if (
                (s[0] === 'width' || s[0] === 'height') &&
                /^\d+$/.test(s[1])
              ) {
                s[1] += 'px';
              }
              styles.push(s.join(':'));
            }
          });
          return h(node, 'img', {
            src: node.url,
            alt: alts.join(' '),
            style: styles.join(';'),
          });
        } catch {
          return h(node, 'img', { src: node.url, alt: node.alt });
        }
      },
    },
  })
  .use(rehypeMermaid, {
    errorFallback: (element) => element,
    strategy: 'img-svg',
  })
  .use(rehypePrism, { ignoreMissing: true })
  .freeze();

/**
 * 将 Markdown 文本转成 Hast 树
 *
 * @param sourceCode Markdown 文本
 * @returns Hast 树
 */
export const preViewerRender = async (sourceCode: string) =>
  await toHastProcessor.run(
    JSON.parse(JSON.stringify(cachedParse(sourceCode))),
  );

/**
 * 过滤模式
 */
export type Schema = typeof defaultSchema;

export const getDefaultSchema = (): Schema => ({
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    custom: ['meta', 'value'],
    span: ['line'],
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className', 'style'],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? []), 'data'],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), 'custom'],
});

const Input = ({ checked, ...props }: any) =>
  jsx('input', { checked: !!checked, ...props });

const Custom = ({ component, value }: any) =>
  jsx(component, { children: value });

/**
 * 将 Hast 树映射到 React 虚拟 DOM 树
 *
 * @param root Hast 树
 * @param options 配置项
 * @returns React 虚拟 DOM 树
 */
export const postViewerRender = (root: HastRoot, options: ViewerOptions) => {
  try {
    const components = {
      ...options.customHTMLElements,
      // 直接在这里写函数会有重复渲染问题，因此用全局组件
      input: Input,
      custom: Custom,
    };
    return toJsxRuntime(
      unified()
        .use(rehypeKatex)
        .use(rehypeCustom, options.customBlocks)
        .runSync(root),
      {
        Fragment,
        jsx,
        jsxs,
        components,
      },
    );
  } catch {
    return jsx('div', {
      style: { fontStyle: 'italic', color: 'red' },
      children: 'Parse error!',
    });
  }
};

const toHTMLProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, {
    allowDangerousHtml: true,
    handlers: {
      math: (h, node: MdastMath) =>
        // 如果 Math 节点的 `meta` 属性不为空，则视为自定义块
        node.meta
          ? h(node.position, 'custom', { meta: node.meta, value: node.value })
          : h(node, 'div'),
    },
  })
  .use(rehypeRawPositions)
  .use(rehypeRaw)
  .use(rehypeMath)
  .use(rehypeStringify)
  .freeze();

/**
 * 将 Markdown 文本转成 HTML 文本
 *
 * @param sourceCode Markdown 文本
 * @returns HTML 文本
 */
export const toHTML = (sourceCode: string) =>
  toHTMLProcessor.processSync(sourceCode).toString();

const toMarkdownProcessor = unified()
  .use(rehypeRemark, {
    newlines: true,
    handlers: {
      div: (h, node) =>
        isMathNode(node)
          ? h(node, 'math', hastToText(node))
          : defaultHandlers.div(h, node),
      span: (h, node) =>
        isMathNode(node)
          ? h(node, 'inlineMath', hastToText(node))
          : defaultHandlers.span(h, node),
      custom: (h, node) =>
        h(node, 'math', { meta: node.properties.meta }, node.properties.value),
    },
  })
  .use(remarkMath)
  .use(remarkGfm)
  .use(remarkStringify)
  .freeze();

/**
 * 将带有 HTML 的 Markdown 文本转成 Markdown 文本
 *
 * @param sourceCode 带有 HTML 的 Markdown 文本
 * @returns Markdown 文本
 */
export const toMarkdown = (sourceCode: string) =>
  toMarkdownProcessor.stringify(
    toMarkdownProcessor.runSync(
      toHTMLProcessor.runSync(toHTMLProcessor.parse(sourceCode)),
    ),
  );

interface ToTextOptions extends ToStringOptions {
  /**
   * 替换图片的 alt 文本
   */
  replaceImageAlt?: string;
}

/**
 * 将 Markdown 文本转成纯文本
 *
 * @param sourceCode Markdown 文本
 * @returns 纯文本
 */
export const toText = (sourceCode: string, options?: ToTextOptions) => {
  const root = toMdastProcessor.parse(sourceCode);
  if (options?.replaceImageAlt) {
    // 遍历 Mdast 树的图片节点，替换 alt 文本
    visit(root, 'image', (node) => {
      node.alt = options.replaceImageAlt;
    });
  }
  return mdastToString(root, options);
};
