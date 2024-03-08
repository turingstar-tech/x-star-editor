# XStarSlideViewer

Markdown 幻灯片渲染器。

## 代码演示

```tsx
/**
 * title: 基本使用
 * description: 使用 `value` 属性传入要查看的 Markdown 源码。更多示例可参考 XStarEditor。
 */

import { XStarSlideViewer } from 'x-star-editor';

export default () => (
  <XStarSlideViewer
    value={`# Markdown 语法示例

## 标题

使用\`#\`可以定义标题，比如：


`}
    theme="lark"
  />
);
```
