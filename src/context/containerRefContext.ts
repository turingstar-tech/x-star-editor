import { createContext } from 'react';
import { XStarMdEditorHandle } from 'x-star-editor/x-star-md-editor';
import { XStarMdViewerHandle } from 'x-star-editor/x-star-md-viewer';

interface IContainerRef {
  editorRef: React.RefObject<XStarMdEditorHandle> | null;
  viewerRef: React.RefObject<XStarMdViewerHandle> | null;
}

export const containerRefContext = createContext<IContainerRef>({
  editorRef: null,
  viewerRef: null,
});
