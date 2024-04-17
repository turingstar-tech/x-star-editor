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
    onPadChange={(point, scale) => {
      console.log(point, scale);
    }}
    padInitialValue={{
      scale: 0.792188,
      points: [
        {
          penColor: '#4285f4',
          dotSize: 0,
          minWidth: 3,
          maxWidth: 5,
          velocityFilterWeight: 0.7,
          compositeOperation: 'source-over',
          points: [
            {
              time: 1713333538121,
              x: 328,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333538209,
              x: 330,
              y: 253,
              pressure: 0.5,
            },
            {
              time: 1713333538243,
              x: 330,
              y: 261,
              pressure: 0.5,
            },
            {
              time: 1713333538278,
              x: 330,
              y: 270,
              pressure: 0.5,
            },
            {
              time: 1713333538312,
              x: 330,
              y: 277,
              pressure: 0.5,
            },
            {
              time: 1713333538360,
              x: 330,
              y: 285,
              pressure: 0.5,
            },
            {
              time: 1713333538392,
              x: 330,
              y: 291,
              pressure: 0.5,
            },
            {
              time: 1713333538408,
              x: 330,
              y: 297,
              pressure: 0.5,
            },
            {
              time: 1713333538457,
              x: 330,
              y: 303,
              pressure: 0.5,
            },
          ],
        },
        {
          penColor: '#4285f4',
          dotSize: 0,
          minWidth: 3,
          maxWidth: 5,
          velocityFilterWeight: 0.7,
          compositeOperation: 'source-over',
          points: [
            {
              time: 1713333539224,
              x: 329,
              y: 239,
              pressure: 0.5,
            },
            {
              time: 1713333539288,
              x: 336,
              y: 241,
              pressure: 0.5,
            },
            {
              time: 1713333539304,
              x: 343,
              y: 242,
              pressure: 0.5,
            },
            {
              time: 1713333539320,
              x: 352,
              y: 244,
              pressure: 0.5,
            },
            {
              time: 1713333539337,
              x: 359,
              y: 245,
              pressure: 0.5,
            },
            {
              time: 1713333539354,
              x: 367,
              y: 245,
              pressure: 0.5,
            },
            {
              time: 1713333539370,
              x: 375,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333539387,
              x: 382,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333539403,
              x: 389,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333539437,
              x: 397,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333539454,
              x: 403,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333539488,
              x: 413,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333539520,
              x: 424,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333539536,
              x: 430,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333539552,
              x: 436,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333539568,
              x: 445,
              y: 246,
              pressure: 0.5,
            },
            {
              time: 1713333539584,
              x: 452,
              y: 244,
              pressure: 0.5,
            },
            {
              time: 1713333539616,
              x: 465,
              y: 243,
              pressure: 0.5,
            },
            {
              time: 1713333539664,
              x: 474,
              y: 243,
              pressure: 0.5,
            },
            {
              time: 1713333539680,
              x: 480,
              y: 243,
              pressure: 0.5,
            },
            {
              time: 1713333539696,
              x: 487,
              y: 243,
              pressure: 0.5,
            },
            {
              time: 1713333539712,
              x: 494,
              y: 242,
              pressure: 0.5,
            },
            {
              time: 1713333539728,
              x: 499,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539776,
              x: 508,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539792,
              x: 514,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539808,
              x: 520,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539824,
              x: 526,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539858,
              x: 533,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539891,
              x: 541,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539908,
              x: 547,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539942,
              x: 556,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539959,
              x: 562,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539976,
              x: 571,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333539992,
              x: 578,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540008,
              x: 584,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540059,
              x: 593,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540093,
              x: 604,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540127,
              x: 612,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540160,
              x: 618,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540192,
              x: 626,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540224,
              x: 632,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540294,
              x: 640,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540328,
              x: 652,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540344,
              x: 658,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540376,
              x: 664,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540440,
              x: 670,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333540584,
              x: 677,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333541096,
              x: 685,
              y: 240,
              pressure: 0.5,
            },
            {
              time: 1713333541545,
              x: 688,
              y: 245,
              pressure: 0.5,
            },
            {
              time: 1713333541612,
              x: 688,
              y: 252,
              pressure: 0.5,
            },
            {
              time: 1713333541678,
              x: 688,
              y: 261,
              pressure: 0.5,
            },
            {
              time: 1713333541728,
              x: 688,
              y: 268,
              pressure: 0.5,
            },
            {
              time: 1713333541760,
              x: 688,
              y: 275,
              pressure: 0.5,
            },
            {
              time: 1713333541812,
              x: 688,
              y: 281,
              pressure: 0.5,
            },
            {
              time: 1713333541864,
              x: 688,
              y: 290,
              pressure: 0.5,
            },
            {
              time: 1713333541976,
              x: 688,
              y: 296,
              pressure: 0.5,
            },
            {
              time: 1713333542141,
              x: 688,
              y: 302,
              pressure: 0.5,
            },
          ],
        },
        {
          penColor: '#4285f4',
          dotSize: 0,
          minWidth: 3,
          maxWidth: 5,
          velocityFilterWeight: 0.7,
          compositeOperation: 'source-over',
          points: [
            {
              time: 1713333543188,
              x: 328,
              y: 296,
              pressure: 0.5,
            },
            {
              time: 1713333543240,
              x: 342,
              y: 295,
              pressure: 0.5,
            },
            {
              time: 1713333543256,
              x: 357,
              y: 295,
              pressure: 0.5,
            },
            {
              time: 1713333543272,
              x: 368,
              y: 295,
              pressure: 0.5,
            },
            {
              time: 1713333543288,
              x: 375,
              y: 295,
              pressure: 0.5,
            },
            {
              time: 1713333543305,
              x: 381,
              y: 295,
              pressure: 0.5,
            },
            {
              time: 1713333543322,
              x: 387,
              y: 295,
              pressure: 0.5,
            },
            {
              time: 1713333543339,
              x: 396,
              y: 295,
              pressure: 0.5,
            },
            {
              time: 1713333543356,
              x: 407,
              y: 295,
              pressure: 0.5,
            },
            {
              time: 1713333543374,
              x: 417,
              y: 295,
              pressure: 0.5,
            },
            {
              time: 1713333543391,
              x: 423,
              y: 295,
              pressure: 0.5,
            },
            {
              time: 1713333543425,
              x: 429,
              y: 294,
              pressure: 0.5,
            },
            {
              time: 1713333543458,
              x: 435,
              y: 293,
              pressure: 0.5,
            },
            {
              time: 1713333543476,
              x: 440,
              y: 292,
              pressure: 0.5,
            },
            {
              time: 1713333543509,
              x: 447,
              y: 292,
              pressure: 0.5,
            },
            {
              time: 1713333543541,
              x: 455,
              y: 290,
              pressure: 0.5,
            },
            {
              time: 1713333543574,
              x: 466,
              y: 289,
              pressure: 0.5,
            },
            {
              time: 1713333543591,
              x: 474,
              y: 289,
              pressure: 0.5,
            },
            {
              time: 1713333543608,
              x: 486,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543639,
              x: 496,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543671,
              x: 502,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543688,
              x: 510,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543704,
              x: 516,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543736,
              x: 524,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543752,
              x: 530,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543768,
              x: 538,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543784,
              x: 547,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543800,
              x: 554,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543832,
              x: 562,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543864,
              x: 572,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543880,
              x: 581,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543896,
              x: 592,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543912,
              x: 600,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543928,
              x: 606,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543962,
              x: 614,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543979,
              x: 621,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333543996,
              x: 627,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333544013,
              x: 633,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333544045,
              x: 642,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333544077,
              x: 651,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333544110,
              x: 657,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333544144,
              x: 664,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333544176,
              x: 673,
              y: 288,
              pressure: 0.5,
            },
            {
              time: 1713333544266,
              x: 681,
              y: 288,
              pressure: 0.5,
            },
          ],
        },
      ],
    }}
  />
);
```

:::

## API

### XStarMdViewer

<API id="XStarSlideViewer"></API>

#### Methods

| 属性名             | 类型                   | 描述                           |
| ------------------ | ---------------------- | ------------------------------ |
| getViewerContainer | `() => HTMLDivElement` | 获取查看器 `div` 元素          |
| getSlideContainer  | `() => HTMLDivElement` | 获取内部 Slide 容器 `div` 元素 |
