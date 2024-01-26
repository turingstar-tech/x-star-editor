import type { Root as HastRoot } from 'hast';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import { unified } from 'unified';
import type { Schema } from './markdown';
import rehypeLine from './rehype/rehype-line';
import rehypeMath from './rehype/rehype-math';
import rehypeRawPositions from './rehype/rehype-raw-positions';

/**
 * 将 Hast 树转成新的 Hast 树
 *
 * @param root Hast 树
 * @param schema 过滤模式
 * @returns 新的 Hast 树
 */
const viewerRender = (root: HastRoot, schema: Schema) =>
  unified()
    .use(rehypeRawPositions)
    .use(rehypeRaw)
    .use(rehypeMath)
    .use(rehypeSanitize, schema)
    .use(rehypeSlug)
    .use(rehypeLine)
    .runSync(root);

self.addEventListener('message', ({ data }) =>
  self.postMessage({ id: data.id, root: viewerRender(data.root, data.schema) }),
);
