import type { PointGroup } from 'signature_pad';

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
