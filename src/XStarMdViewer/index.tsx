import classNames from 'classnames/bind';
import React, { useImperativeHandle, useRef } from 'react';
import '../styles/katex.css';
import '../styles/prism.css';
import { composeHandlers } from '../utils/handler';
import type { ViewerOptions } from '../utils/markdown';
import { viewerRender } from '../utils/markdown';
import styles from './index.module.css';

const cx = classNames.bind(styles);

export interface XStarMdViewerPlugin {
  (ctx: ViewerOptions): void;
}

export interface XStarMdViewerHandle {
  getContainer: () => HTMLDivElement | null;
}

export interface XStarMdViewerProps {
  className?: string;
  style?: React.CSSProperties;
  value?: string;
  plugins?: XStarMdViewerPlugin[];
}

const XStarMdViewer = React.forwardRef<XStarMdViewerHandle, XStarMdViewerProps>(
  ({ className, style, value = '', plugins }, ref) => {
    const container = useRef<HTMLDivElement>(null);

    useImperativeHandle(
      ref,
      () => ({ getContainer: () => container.current }),
      [],
    );

    return (
      <div
        ref={container}
        className={cx('x-star-md-viewer', 'container', className)}
        style={style}
      >
        {viewerRender(
          value,
          composeHandlers(plugins)({
            customHTMLElements: {},
            customBlocks: {},
          }),
        )}
      </div>
    );
  },
);

XStarMdViewer.displayName = 'XStarMdViewer';

export default XStarMdViewer;

export const useMdViewerRef = () => useRef<XStarMdViewerHandle>(null);
