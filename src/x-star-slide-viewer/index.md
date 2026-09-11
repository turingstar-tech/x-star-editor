# XStarSlideViewer

Markdown 幻灯片渲染器。

## 代码演示

```tsx
/**
 * title: 基本使用
 * description: 使用 `value` 属性传入要查看的 Markdown 源码。更多示例可参考 XStarEditor。
 */

import React, { useState } from 'react';
import { XStarSlideViewer } from 'x-star-editor';
import styles from './_test.module.scss';

export default () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  return (
    <XStarSlideViewer
      slideClassName={styles.slide}
      value={`
###### BUBBLE SORT AND SELECTION SORT

# 冒泡排序与选择排序

信友队C++课程
`}
      locale="en_US"
      currentPage={currentPage}
      totalPages={totalPages}
      onPrevious={() => setCurrentPage((page) => page - 1)}
      onNext={() => setCurrentPage((page) => page + 1)}
      onPadChange={console.log}
    />
  );
};
```

## API

### XStarMdViewer

<API id="XStarSlideViewer"></API>

#### Methods

| 属性名             | 类型                   | 描述                           |
| ------------------ | ---------------------- | ------------------------------ |
| getViewerContainer | `() => HTMLDivElement` | 获取查看器 `div` 元素          |
| getSlideContainer  | `() => HTMLDivElement` | 获取内部 Slide 容器 `div` 元素 |
