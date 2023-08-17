import classNames from 'classnames';
import React, { useImperativeHandle, useRef } from 'react';
import { prefix } from '../utils/global';
import { composeHandlers } from '../utils/handler';
import type { ViewerOptions } from '../utils/markdown';
import { getDefaultSchema, viewerRender } from '../utils/markdown';

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
        className={classNames(`${prefix}md-viewer`, className)}
        style={style}
      >
        {viewerRender(
          value,
          composeHandlers(plugins)({
            customSchema: getDefaultSchema(),
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
