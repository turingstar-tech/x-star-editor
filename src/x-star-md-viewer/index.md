# XStarMdViewer

Markdown 查看器。

## 代码演示

```tsx
/**
 * title: 基本使用
 * description: 使用 `value` 属性传入要查看的 Markdown 源码。使用 `enableWebWorker` 属性启用 Web Worker 渲染。更多示例可参考 XStarEditor。
 */

import { XStarMdViewer } from 'x-star-editor';

export default () => (
  <XStarMdViewer
    value={`# Markdown 语法示例

## 标题

使用\`#\`可以定义标题，比如：

\`\`\`markdown
# 这是一级标题
## 这是二级标题
### 这是三级标题
\`\`\`

效果：

# 这是一级标题
## 这是二级标题
### 这是三级标题

---

## 强调

使用\`*\`或\`_\`来强调文本，例如：

\`\`\`markdown
*这是斜体*
**这是粗体**
***这是加粗斜体***
\`\`\`

效果：

*这是斜体*
**这是粗体**
***这是加粗斜体***

---

## 列表

### 无序列表

可以使用\`*\`，\`+\`或\`-\`来创建无序列表，例如：

\`\`\`markdown
* 列表项一
* 列表项二
* 列表项三
\`\`\`

效果：

* 列表项一
* 列表项二
* 列表项三

---

### 有序列表

使用数字和\`.\`来创建有序列表，例如：

\`\`\`markdown
1. 列表项一
2. 列表项二
3. 列表项三
\`\`\`

效果：

1. 列表项一
2. 列表项二
3. 列表项三

---

## 链接和图片

### 链接

使用\`[]\`包裹链接文本，之后用\`()\`包裹链接地址，例如：

\`\`\`markdown
[Markdown](https://daringfireball.net/projects/markdown/)
\`\`\`

效果：

[Markdown](https://daringfireball.net/projects/markdown/)

---

### 图片

图片的语法和链接类似，只是在前面多了一个\`!\`，例如：

\`\`\`markdown
![Markdown Logo](https://daringfireball.net/graphics/logos/)
\`\`\`

效果：

![Markdown Logo](https://daringfireball.net/graphics/logos/)

---

## 代码

### 行内代码

使用\`反引号\`可以创建行内代码，例如：

\`\`\`markdown
这是一个\`行内代码\`示例
\`\`\`

效果：

这是一个\`行内代码\`示例

---

### 代码块

使用三个\`反引号\`可以创建代码块，例如：

\`\`\`\`markdown
\`\`\`
print('Hello, Markdown!')
\`\`\`
\`\`\`\`

效果：

\`\`\`
print('Hello, Markdown!')
\`\`\`

---

## 表格

可以使用\`-\`和\`|\`来创建表格，例如：

\`\`\`markdown
| 姓名 | 年龄 |
| --- | --- |
| 张三 | 20 |
| 李四 | 25 |
\`\`\`

效果：

| 姓名 | 年龄 |
| --- | --- |
| 张三 | 20 |
| 李四 | 25 |

---

## 引用

使用\`>\`可以创建引用，例如：

\`\`\`markdown
> 这是一段引用
\`\`\`

效果：

> 这是一段引用`}
    theme="lark"
  />
);
```

:::info
如果要使用内置主题，请引入主题样式文件。

```ts | pure
import 'x-star-editor/dist/themes/lark.css';
```

:::

:::warning
使用 `enableWebWorker` 时，每个查看器会单独启动一个 Web Worker，且渲染会存在短暂延迟。
:::

## API

### XStarMdViewer

<API id="XStarMdViewer"></API>

#### Methods

| 属性名             | 类型                   | 描述                  |
| ------------------ | ---------------------- | --------------------- |
| getViewerContainer | `() => HTMLDivElement` | 获取查看器 `div` 元素 |

### XStarMdViewerPlugin

查看器插件是一个函数，接收一个查看器选项对象，对其进行操作。

```ts
interface XStarMdViewerPlugin {
  (ctx: ViewerOptions): void;
}
```

#### ViewerOptions

| 属性名             | 类型                                                                 | 描述             |
| ------------------ | -------------------------------------------------------------------- | ---------------- |
| customSchema       | `Schema`                                                             | 自定义过滤模式   |
| customHTMLElements | `Partial<Components>`                                                | 自定义 HTML 元素 |
| customBlocks       | `Partial<Record<string, React.ComponentType<{ children: string }>>>` | 自定义块         |
