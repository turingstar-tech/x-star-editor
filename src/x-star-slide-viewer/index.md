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
    locale={'en_US'}
    // padInitialValue={{
    //   scale: 0.771875,
    //   points: [
    //     {
    //       penColor: '#4285f4',
    //       dotSize: 0,
    //       minWidth: 3,
    //       maxWidth: 5,
    //       velocityFilterWeight: 0.7,
    //       compositeOperation: 'source-over',
    //       points: [
    //         {
    //           time: 1713426557985,
    //           x: 323,
    //           y: 240,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426558024,
    //           x: 321,
    //           y: 245,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426558040,
    //           x: 320,
    //           y: 252,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426558057,
    //           x: 319,
    //           y: 259,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426558074,
    //           x: 319,
    //           y: 266,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426558092,
    //           x: 319,
    //           y: 274,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426558109,
    //           x: 319,
    //           y: 280,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426558144,
    //           x: 319,
    //           y: 286,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426558210,
    //           x: 319,
    //           y: 292,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426558295,
    //           x: 319,
    //           y: 299,
    //           pressure: 0.5,
    //         },
    //       ],
    //     },
    //     {
    //       penColor: '#4285f4',
    //       dotSize: 0,
    //       minWidth: 3,
    //       maxWidth: 5,
    //       velocityFilterWeight: 0.7,
    //       compositeOperation: 'source-over',
    //       points: [
    //         {
    //           time: 1713426559172,
    //           x: 323,
    //           y: 237,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559224,
    //           x: 333,
    //           y: 237,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559241,
    //           x: 346,
    //           y: 237,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559258,
    //           x: 361,
    //           y: 237,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559274,
    //           x: 374,
    //           y: 237,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559290,
    //           x: 386,
    //           y: 237,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559306,
    //           x: 399,
    //           y: 236,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559324,
    //           x: 406,
    //           y: 235,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559340,
    //           x: 415,
    //           y: 233,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559357,
    //           x: 423,
    //           y: 232,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559374,
    //           x: 432,
    //           y: 232,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559390,
    //           x: 439,
    //           y: 232,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559406,
    //           x: 449,
    //           y: 232,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559422,
    //           x: 457,
    //           y: 231,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559438,
    //           x: 468,
    //           y: 229,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559455,
    //           x: 478,
    //           y: 229,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559472,
    //           x: 487,
    //           y: 229,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559488,
    //           x: 497,
    //           y: 229,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559505,
    //           x: 509,
    //           y: 229,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559522,
    //           x: 518,
    //           y: 228,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559538,
    //           x: 525,
    //           y: 228,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559572,
    //           x: 538,
    //           y: 228,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559590,
    //           x: 546,
    //           y: 228,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559605,
    //           x: 555,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559621,
    //           x: 562,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559638,
    //           x: 569,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559670,
    //           x: 578,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559686,
    //           x: 586,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559702,
    //           x: 593,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559734,
    //           x: 601,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559766,
    //           x: 612,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559782,
    //           x: 619,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559798,
    //           x: 626,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559830,
    //           x: 633,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559895,
    //           x: 645,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559912,
    //           x: 655,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559928,
    //           x: 662,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426559945,
    //           x: 668,
    //           y: 227,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426560240,
    //           x: 671,
    //           y: 234,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426560274,
    //           x: 671,
    //           y: 245,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426560307,
    //           x: 671,
    //           y: 253,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426560340,
    //           x: 671,
    //           y: 263,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426560372,
    //           x: 671,
    //           y: 271,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426560406,
    //           x: 671,
    //           y: 278,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426560463,
    //           x: 670,
    //           y: 283,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426560598,
    //           x: 670,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //       ],
    //     },
    //     {
    //       penColor: '#4285f4',
    //       dotSize: 0,
    //       minWidth: 3,
    //       maxWidth: 5,
    //       velocityFilterWeight: 0.7,
    //       compositeOperation: 'source-over',
    //       points: [
    //         {
    //           time: 1713426561193,
    //           x: 329,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561247,
    //           x: 349,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561264,
    //           x: 372,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561280,
    //           x: 392,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561296,
    //           x: 409,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561313,
    //           x: 423,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561331,
    //           x: 435,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561349,
    //           x: 447,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561366,
    //           x: 464,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561382,
    //           x: 475,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561398,
    //           x: 487,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561414,
    //           x: 498,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561430,
    //           x: 508,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561446,
    //           x: 514,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561462,
    //           x: 523,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561478,
    //           x: 534,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561494,
    //           x: 543,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561510,
    //           x: 550,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561526,
    //           x: 557,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561543,
    //           x: 565,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561560,
    //           x: 577,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561576,
    //           x: 589,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561593,
    //           x: 602,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561610,
    //           x: 611,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561643,
    //           x: 618,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561659,
    //           x: 624,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561675,
    //           x: 630,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561692,
    //           x: 638,
    //           y: 291,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561709,
    //           x: 650,
    //           y: 290,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561726,
    //           x: 658,
    //           y: 289,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561808,
    //           x: 664,
    //           y: 288,
    //           pressure: 0.5,
    //         },
    //         {
    //           time: 1713426561841,
    //           x: 670,
    //           y: 287,
    //           pressure: 0.5,
    //         },
    //       ],
    //     },
    //   ],
    // }}
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
