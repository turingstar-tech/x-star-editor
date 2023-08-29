import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { unified } from 'unified';
import type { HastRoot, Schema } from './markdown';

self.addEventListener('message', (e: MessageEvent<[HastRoot, Schema]>) => {
  self.postMessage(
    unified()
      .use(rehypeRaw)
      .use(rehypeSanitize, e.data[1])
      .use(() => (root) => {
        for (const node of root.children) {
          if ('properties' in node && node.properties) {
            node.properties['data-line'] = node.position?.start.line;
          }
        }
      })
      .runSync(e.data[0]),
  );
});
