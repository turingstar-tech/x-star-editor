import _ from 'lodash';
import { CanvasData } from 'x-star-editor/x-star-slide-viewer';

/**
 *
 * @param scaleString
 * @returns 'scale(3)' -> 3
 */
export const getScaleNumber = (scaleString: string) =>
  Number(scaleString.replace('scale(', '').replace(')', ''));

/**
 *
 * @param pointData
 * @param parentWidth
 */
export const computeScaledPoint = (
  // 计算点scale后的坐标值
  pointData: CanvasData,
  parentWidth: number,
) => {
  const beforeScale = pointData.scale;
  const newData = _.cloneDeep(pointData.points);
  newData.forEach(({ points }) =>
    points.forEach((point) => {
      point.x = (point.x / beforeScale) * (parentWidth / 1280);
      point.y = (point.y / beforeScale) * (parentWidth / 1280);
    }),
  );
  return newData;
};
