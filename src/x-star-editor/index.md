# XStarEditor

```jsx
/**
 * title: 基本用法
 */

import { useState } from 'react';
import { XStarEditor } from 'x-star-editor';

export default () => {
  const [locale, setLocale] = useState('zh_CN');

  return (
    <>
      <button
        style={{ marginBottom: 8 }}
        onClick={() => setLocale(locale === 'zh_CN' ? 'en_US' : 'zh_CN')}
      >
        当前语言：{locale}
      </button>
      <XStarEditor
        height="50vh"
        locale={locale}
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
        enableWebWorker
      />
    </>
  );
};
```

```jsx
/**
 * title: 操作编辑器
 */

import {
  XStarEditor,
  createSelection,
  insertHandler,
  useEditorRef,
} from 'x-star-editor';

export default () => {
  const ref = useEditorRef();

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <button
          style={{ marginRight: 8 }}
          onClick={() =>
            // 使用内置 Handler
            ref.current?.exec(insertHandler({ text: 'Hello world!\n' }))
          }
        >
          插入一段话
        </button>
        <button
          onClick={() => {
            const editor = ref.current?.getEditorContainer();
            // 使用自定义 Handler
            ref.current?.exec(({ selection, dispatch }) =>
              dispatch({
                type: 'set',
                payload: {
                  sourceCode: JSON.stringify(editor?.getBoundingClientRect()),
                  selection: createSelection(0),
                },
                selection,
              }),
            );
          }}
        >
          获取容器
        </button>
      </div>
      <XStarEditor ref={ref} height="50vh" />
    </>
  );
};
```

```jsx
/**
 * 使用插件
 */

import type { XStarMdEditorPlugin, XStarMdViewerPlugin } from 'x-star-editor';
import { XStarEditor, createSelection, getRange } from 'x-star-editor';

const toolbarPlugin = (): XStarMdEditorPlugin => (ctx) => {
  // 工具栏
  ctx.toolbarItems.push([
    // 点击时将选中的文本替换成 click
    {
      children: (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          @
        </div>
      ),
      tooltip: '测试',
      onClick: (exec) =>
        exec(({ sourceCode, selection, dispatch }) => {
          const { startOffset, endOffset } = getRange(selection);
          dispatch({
            type: 'set',
            payload: {
              sourceCode: `${sourceCode.slice(
                0,
                startOffset,
              )}click${sourceCode.slice(endOffset)}`,
              selection: createSelection(startOffset, startOffset + 5),
            },
            selection,
          });
        }),
    },
  ]);
};

const keyboardPlugin = (): XStarMdEditorPlugin => (ctx) => {
  // 键盘事件处理函数
  ctx.keyboardEventHandlers.push(({ sourceCode, selection, dispatch, e }) => {
    // 按下 Ctrl + Shift + C 将选中的文本替换成 press
    if (!e.altKey && e.ctrlKey && !e.metaKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      const { startOffset, endOffset } = getRange(selection);
      dispatch({
        type: 'set',
        payload: {
          sourceCode: `${sourceCode.slice(
            0,
            startOffset,
          )}press${sourceCode.slice(endOffset)}`,
          selection: createSelection(startOffset, startOffset + 5),
        },
        selection,
      });
    }
  });
};

const htmlPlugin = (): XStarMdViewerPlugin => (ctx) => {
  // 自定义 HTML 元素
  ctx.customHTMLElements.pre = (props) => (
    <pre {...props} style={{ borderRadius: '1em' }} />
  );
};

const blockPlugin = (): XStarMdViewerPlugin => (ctx) => {
  // 自定义块
  ctx.customBlocks.question = ({ children }) => (
    <strong>question block: {children}</strong>
  );
};

export default () => (
  <XStarEditor
    height="50vh"
    initialValue={`
\`\`\`cpp
#include <iostream>
using namespace std;
int main() {
  cout << "Hello world!" << endl;
  return 0;
}
\`\`\`

$$
\\delta=b^2-4ac
$$

$$question
Hello world!
$$
`}
    editorProps={{ plugins: [toolbarPlugin(), keyboardPlugin()] }}
    viewerProps={{ plugins: [htmlPlugin(), blockPlugin()] }}
  />
);
```

## API

<API id="XStarEditor"></API>
