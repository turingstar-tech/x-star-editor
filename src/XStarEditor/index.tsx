import classNames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';
import type { XStarMdEditorHandle, XStarMdEditorProps } from '../XStarMdEditor';
import XStarMdEditor from '../XStarMdEditor';
import type { XStarMdViewerHandle, XStarMdViewerProps } from '../XStarMdViewer';
import XStarMdViewer from '../XStarMdViewer';
import styles from './index.module.css';

const cx = classNames.bind(styles);

export interface XStarMDProps {
  height?: React.CSSProperties['height'];
  initialValue?: string;
  editorProps?: Omit<XStarMdEditorProps, 'initialValue' | 'onChange'>;
  viewerProps?: Omit<XStarMdViewerProps, 'value'>;
  onChange?: (value: string) => void;
}

const XStarEditor = ({
  height,
  initialValue,
  editorProps,
  viewerProps,
  onChange,
}: XStarMDProps) => {
  const [value, setValue] = useState(initialValue);

  const editorRef = useRef<XStarMdEditorHandle>(null);
  const viewerRef = useRef<XStarMdViewerHandle>(null);

  useEffect(() => {
    const editor = editorRef.current?.getContainer();
    const viewer = viewerRef.current?.getContainer();

    /**
     * 获取一个父元素的子元素到父元素顶部的距离
     *
     * @param element 父元素
     * @param index 是否只考虑有 `index` 属性的子元素
     * @returns 子元素到父元素顶部的距离
     */
    const getOffsetTops = (element: HTMLDivElement, index: boolean) => {
      const offsetTops = [0];
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        if (
          child instanceof HTMLElement &&
          (!index || child.hasAttribute('index'))
        ) {
          offsetTops.push(child.offsetTop);
        }
      }
      offsetTops.push(element.scrollHeight);
      return offsetTops;
    };

    const listener = (e: Event) => {
      if (!editor || !viewer) {
        return;
      }
      const [fromElement, toElement] =
        e.currentTarget === editor ? [editor, viewer] : [viewer, editor];
      const fromOffsetTops = getOffsetTops(fromElement, fromElement === editor);
      const toOffsetTops = getOffsetTops(toElement, toElement === editor);
      for (let i = 0; i < fromOffsetTops.length - 1; i++) {
        if (
          fromOffsetTops[i] <= fromElement.scrollTop &&
          fromElement.scrollTop < fromOffsetTops[i + 1]
        ) {
          toElement.scrollTop =
            ((fromElement.scrollTop - fromOffsetTops[i]) /
              (fromOffsetTops[i + 1] - fromOffsetTops[i])) *
              (toOffsetTops[i + 1] - toOffsetTops[i]) +
            toOffsetTops[i];
          break;
        }
      }
    };

    editor?.addEventListener('scroll', listener, {
      capture: true,
      passive: true,
    });
    viewer?.addEventListener('scroll', listener, {
      capture: true,
      passive: true,
    });
    return () => {
      editor?.removeEventListener('scroll', listener, { capture: true });
      viewer?.removeEventListener('scroll', listener, { capture: true });
    };
  }, []);

  return (
    <div className={cx('container')}>
      <XStarMdEditor
        ref={editorRef}
        {...editorProps}
        className={cx('editor', editorProps?.className)}
        style={{ height, ...editorProps?.style }}
        toolbarClassName={cx('toolbar', editorProps?.toolbarClassName)}
        initialValue={initialValue}
        onChange={(value) => {
          setValue(value);
          onChange?.(value);
        }}
      />
      <XStarMdViewer
        ref={viewerRef}
        {...viewerProps}
        className={cx('viewer', viewerProps?.className)}
        style={{ height, ...viewerProps?.style }}
        value={value}
      />
    </div>
  );
};

export default XStarEditor;
