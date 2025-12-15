import ColorPicker, { Color } from '@rc-component/color-picker';
import '@rc-component/color-picker/assets/index.css';
import React, { useMemo, useState } from 'react';
import { useLocale } from '../locales';
import type { Executor } from '../utils/handler';
import { toggleHandler } from '../utils/handler';

interface PickColorProps {
  exec: Executor;
  close: () => void;
}

const defaultColor = '#1677FF';

export const toHexFormat = (value?: string) =>
  value?.replace(/[^0-9a-fA-F#]/g, '').slice(0, 9) || '';

const PickColor = ({ exec, close }: PickColorProps) => {
  const [value, setValue] = useState<Color | string>(defaultColor);
  const { format: t } = useLocale('textColor');
  const color = useMemo(
    () =>
      typeof value === 'string'
        ? value
        : value.getAlpha() < 1
        ? value.toHex8String()
        : value.toHexString(),
    [value],
  );

  return (
    <ColorPicker
      value={value}
      onChange={setValue}
      panelRender={(panel) => {
        return (
          <div>
            {panel}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <input
                value={color}
                onChange={(e) => {
                  const originValue = e.target.value;
                  setValue(toHexFormat(originValue));
                }}
              />
              <button
                type="button"
                onClick={() => {
                  exec(toggleHandler({ type: 'textColor', color }));
                  close();
                }}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        );
      }}
    />
  );
};

export default PickColor;
