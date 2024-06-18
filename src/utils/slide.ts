import type { PointGroup } from 'signature_pad';

/**
 * 获取缩放值
 *
 * @param scale scale 函数字符串
 * @returns 缩放值
 */
export const getScale = (scale: string) =>
  Number(scale.match(/scale\((.*?)\)/)?.[1]);

export interface PadValue {
  data: PointGroup[];
  scale: number;
}

/**
 * 计算缩放后点的坐标值
 *
 * @param padValue 画板数据
 * @param parentWidth 父元素宽度
 * @returns 新坐标值
 */
export const getScaledData = ({ data, scale }: PadValue, parentWidth: number) =>
  data.map((group) => ({
    ...group,
    points: group.points.map((point) => ({
      ...point,
      x: (point.x / scale) * (parentWidth / 1280),
      y: (point.y / scale) * (parentWidth / 1280),
    })),
  }));
