# XStarEditor

```jsx
import { XStarEditor } from 'x-star-editor';

export default () => (
  <XStarEditor
    height="80vh"
    locale="en_US"
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

> 这是一段引用
`}
  />
);
```

## API

<API id="XStarEditor"></API>
