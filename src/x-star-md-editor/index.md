# XStarMdEditor

Markdown 编辑器。需要查看正在编辑的 Markdown 时，请使用 XStarEditor。

## 代码演示

```tsx
/**
 * title: 基本使用
 * description: 更多示例可参考 XStarEditor。
 */

import { XStarMdEditor } from 'x-star-editor';

export default () => (
  <XStarMdEditor
    height="50vh"
    initialValue={`# Markdown 语法示例

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
  />
);
```

## API

### XStarMdEditor

<API id="XStarMdEditor"></API>

#### Methods

| 属性名             | 类型                      | 描述                  |
| ------------------ | ------------------------- | --------------------- |
| exec               | `Executor`                | 执行函数              |
| getEditorContainer | `() => HTMLDivElement`    | 获取编辑器 `div` 元素 |
| getValue           | `() => string`            | 获取编辑器的值        |
| setValue           | `(value: string) => void` | 设置编辑器的值        |

### XStarMdEditorPlugin

编辑器插件是一个函数，接收一个编辑器选项对象，对其进行操作。

```ts
interface XStarMdEditorPlugin {
  (ctx: EditorOptions): void;
}
```

#### EditorOptions

| 属性名                | 类型                     | 描述             |
| --------------------- | ------------------------ | ---------------- |
| toolbarItemMap        | `ToolbarItemMap`         | 工具栏项映射     |
| toolbarItems          | `ToolbarItems`           | 工具栏项数组     |
| keyboardEventHandlers | `KeyboardEventHandler[]` | 键盘事件处理函数 |

#### ToolbarItemMap

工具栏项映射是一个对象，键表示工具栏项的名称，值表示工具栏项。

```ts
type ToolbarItemMap = Partial<Record<string, ToolbarItem>>;
```

#### ToolbarItems

工具栏项数组表示工具栏展示的工具栏项，是一个二维数组，第一维表示工具栏项的分组。值如果是字符串，表示从工具栏项映射中获取工具栏项。

```ts
type ToolbarItems = (string | ToolbarItem)[][];

const getDefaultToolbarItems = (): ToolbarItems => [
  ['heading', 'strong', 'emphasis', 'delete'],
  ['thematicBreak', 'blockquote', 'table'],
  ['link', 'image', 'mermaid'],
  ['inlineCode', 'code', 'inlineMath', 'math'],
  ['orderedList', 'unorderedList', 'taskList'],
  ['toMarkdown', 'toHTML'],
  ['undo', 'redo'],
];
```

#### ToolbarItem

工具栏项可以为工具栏项属性，或者为一个根据上下文获取工具栏项属性的函数。

```ts
type ToolbarItem = ToolbarItemProps | Handler<ToolbarItemProps>;
```

#### ToolbarItemProps

工具栏项属性用于渲染工具栏项。

| 属性名        | 类型                                                     | 描述             |
| ------------- | -------------------------------------------------------- | ---------------- |
| children      | `React.ReactNode`                                        | 子节点           |
| disabled      | `boolean`                                                | 是否禁用         |
| tooltip       | `React.ReactNode`                                        | 文字提示         |
| popoverRender | `(exec: Executor, close: () => void) => React.ReactNode` | 气泡卡片渲染函数 |
| onClick       | `(exec: Executor) => void`                               | 点击回调函数     |

:::warning
如果工具栏项是一个函数，在 `popoverRender` 和 `onClick` 中，请始终使用 `exec` 获取最新的上下文。
:::

#### KeyboardEventHandler

键盘事件处理函数与普通处理函数类似，上下文中包含键盘事件。

```ts
interface KeyboardEventHandler {
  (ctx: HandlerContext & { e: React.KeyboardEvent }): void;
}
```
