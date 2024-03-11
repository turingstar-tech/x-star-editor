# XStarSlideViewer

Markdown 幻灯片渲染器。

## 代码演示

```tsx
/**
 * title: 基本使用
 * description: 使用 `value` 属性传入要查看的 Markdown 源码。更多示例可参考 XStarEditor。
 */

import { XStarSlideViewer } from 'x-star-editor';
import styles from './test.module.scss';

const blockPlugin = (): XStarMdViewerPlugin => (ctx) => {
  // 自定义块
  ctx.customBlocks.test = ({ children }) => (
    <strong>test block: {children}</strong>
  );
};

export default () => (
  <XStarSlideViewer
    value={`
# Consider the contribution

For one plan, just need to count the number of i such that $ [i- 1,i] $ is not covered but
$[i, i + 1]$ is covered.

For the answer, using linearity of expectation, we only need to find the number of plans
that cover $[i,i+1]$ but not not cover $[i - 1,i]$ for all i.

Count the number of intervals that cover $[i - 1, i]$ (call it $x$), then the contribution of
is $2^{n-x-1}$.

\`\`\`cpp showLineNumbers
151515456151651564651
\`\`\`

\`\`\`mermaid
gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    section Section
        A task          :a1, 2014-01-01, 30d
        Another task    :after a1, 20d
    section Another
        Task in Another :2014-01-12, 12d
        another task    :24d
\`\`\`

$$test
fdsafsa
$$

`}
    theme="lark"
    slideClassName={styles.slide}
    plugins={[blockPlugin()]}
  />
);
```
