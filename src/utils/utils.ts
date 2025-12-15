/**
 * 防抖函数
 * @param func
 * @param delay
 * @param immediate
 * @returns
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  delay: number = 600,
  immediate = false,
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null;

  return (...args: Parameters<F>) => {
    const later = () => {
      timeoutId = null;
      if (!immediate) {
        func(...args);
      }
    };

    const callNow = immediate && !timeoutId;

    clearTimeout(timeoutId!);
    timeoutId = setTimeout(later, delay);

    if (callNow) {
      func(...args);
    }
  };
};
