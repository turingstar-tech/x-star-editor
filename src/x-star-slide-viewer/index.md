# XStarSlideViewer

Markdown 幻灯片渲染器。

## 代码演示

```tsx
/**
 * title: 基本使用
 * description: 使用 `value` 属性传入要查看的 Markdown 源码。更多示例可参考 XStarEditor。
 */

import { XStarSlideViewer } from 'x-star-editor';
import styles from './_test.module.scss';

export default () => (
  <XStarSlideViewer
    value={`
###### BUBBLE SORT AND SELECTION SORT

# 冒泡排序与选择排序

信友队C++课程

`}
    slideClassName={styles.slide}
  />
);
```

:::

## API

### XStarMdViewer

<API id="XStarSlideViewer"></API>

#### Methods

| 属性名            | 类型                   | 描述                    |
| ----------------- | ---------------------- | ----------------------- |
| getSlideContainer | `() => HTMLDivElement` | 获取内层容器 Slide 元素 |
