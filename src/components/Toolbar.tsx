import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { getFormat } from '../locales';
import { createSelection } from '../utils/container';
import { prefix } from '../utils/global';
import type { Executor, Handler } from '../utils/handler';
import { redoHandler, toggleHandler, undoHandler } from '../utils/handler';
import { toHTML, toMarkdown } from '../utils/markdown';
import Fade from './Fade';
import FileInput from './FileInput';

interface ButtonProps {
  children: React.ReactNode;
  toolbarRef: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
  tooltip?: React.ReactNode;
  popoverRender?: (close: () => void) => React.ReactNode;
  onClick?: () => void;
}

const Button = ({
  children,
  toolbarRef,
  disabled,
  tooltip,
  popoverRender,
  onClick,
}: ButtonProps) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const popover = popoverRender?.(() => setPopoverOpen(false));
  const popoverMount = !!popover && popoverOpen;
  const tooltipMount = !popoverMount && !!tooltip && tooltipOpen;

  const tooltipRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (popoverMount) {
      if (toolbarRef.current && popoverRef.current) {
        const left =
          toolbarRef.current.getBoundingClientRect().right -
          popoverRef.current.getBoundingClientRect().right;
        popoverRef.current.style.left = `${left < 0 ? left : 0}px`;
      }

      const listener = (e: MouseEvent) => {
        if (
          !(e.target instanceof Node) ||
          !popoverRef.current?.contains(e.target)
        ) {
          setPopoverOpen(false);
        }
      };

      document.addEventListener('click', listener, {
        capture: true,
        passive: true,
      });
      return () =>
        document.removeEventListener('click', listener, { capture: true });
    }
  }, [popoverMount]);

  return (
    <div className={classNames(`${prefix}button-container`)}>
      <div
        className={classNames(`${prefix}button`, {
          [`${prefix}disabled`]: disabled,
          [`${prefix}active`]: tooltipOpen || popoverMount,
        })}
        onClick={() => {
          if (!disabled) {
            setPopoverOpen(true);
            onClick?.();
          }
        }}
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
      >
        {children}
      </div>
      <Fade nodeRef={tooltipRef} appear={tooltipMount} timeout={300}>
        <div ref={tooltipRef} className={classNames(`${prefix}tooltip`)}>
          {tooltip}
        </div>
      </Fade>
      <Fade nodeRef={popoverRef} appear={popoverMount} timeout={300}>
        <div ref={popoverRef} className={classNames(`${prefix}popover`)}>
          {popover}
        </div>
      </Fade>
    </div>
  );
};

interface ToolbarItemProps {
  children: React.ReactNode;
  disabled?: boolean;
  tooltip?: React.ReactNode;
  popoverRender?: (exec: Executor, close: () => void) => React.ReactNode;
  onClick?: (exec: Executor) => void;
}

type ToolbarItem = ToolbarItemProps | Handler<ToolbarItemProps>;

export type ToolbarItemMap = Partial<Record<string, ToolbarItem>>;

export const getDefaultToolbarItemMap = (
  locale = '',
  onInsertFile?: (
    file: File,
    options: { description: string; image: boolean },
  ) => void,
): ToolbarItemMap => {
  const iconPrefix = `${prefix}icon-`;

  const t = getFormat(locale, 'toolbarItem');

  return {
    blockquote: {
      children: (
        <div
          className={classNames(`${prefix}icon`, `${iconPrefix}blockquote`)}
        />
      ),
      tooltip: t('blockquote'),
      onClick: (exec) => exec(toggleHandler({ type: 'blockquote' })),
    },

    code: {
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}code`)} />
      ),
      tooltip: t('code'),
      popoverRender: (exec, close) => {
        const optionRender = (label: string, language: string) => (
          <div
            className={classNames(`${prefix}option`)}
            onClick={() => {
              exec(toggleHandler({ type: 'code', language }));
              close();
            }}
          >
            {label}
          </div>
        );
        return (
          <>
            {optionRender('C++', 'cpp')}
            {optionRender('Java', 'java')}
            {optionRender('Python', 'py')}
            {optionRender('Text', 'txt')}
          </>
        );
      },
    },

    delete: {
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}delete`)} />
      ),
      tooltip: t('delete'),
      onClick: (exec) => exec(toggleHandler({ type: 'delete' })),
    },

    emphasis: {
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}emphasis`)} />
      ),
      tooltip: t('emphasis'),
      onClick: (exec) => exec(toggleHandler({ type: 'emphasis' })),
    },

    // fullscreen: {
    //   children: (
    //     <div
    //       className={classNames(
    //         `${prefix}icon`,
    //         `${iconPrefix}fullscreen-enter`,
    //       )}
    //     />
    //   ),
    // },

    heading: {
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}heading`)} />
      ),
      tooltip: t('heading'),
      popoverRender: (exec, close) => {
        const optionRender = (
          depth: 1 | 2 | 3 | 4 | 5 | 6,
          fontSize: string,
        ) => (
          <div
            className={classNames(`${prefix}option`)}
            style={{ fontSize }}
            onClick={() => {
              exec(toggleHandler({ type: 'heading', depth }));
              close();
            }}
          >
            H{depth} {t('heading')} {depth}
          </div>
        );
        return (
          <>
            {optionRender(1, '1.6em')}
            {optionRender(2, '1.3em')}
            {optionRender(3, '1.2em')}
            {optionRender(4, '1.1em')}
            {optionRender(5, '1em')}
            {optionRender(6, '0.9em')}
          </>
        );
      },
    },

    image: {
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}image`)} />
      ),
      tooltip: t('image'),
      popoverRender: (exec, close) => (
        <FileInput
          onCancel={close}
          onOk={(data) => {
            if (data.type === 'file') {
              onInsertFile?.(data.file, {
                description: data.description,
                image: true,
              });
            } else {
              exec(
                toggleHandler({
                  type: 'image',
                  url: data.url,
                  description: data.description,
                }),
              );
            }
            close();
          }}
        />
      ),
    },

    inlineCode: {
      children: (
        <div
          className={classNames(`${prefix}icon`, `${iconPrefix}inline-code`)}
        />
      ),
      tooltip: t('inlineCode'),
      onClick: (exec) => exec(toggleHandler({ type: 'inlineCode' })),
    },

    inlineMath: {
      children: (
        <div
          className={classNames(`${prefix}icon`, `${iconPrefix}inline-math`)}
        />
      ),
      tooltip: t('inlineMath'),
      onClick: (exec) => exec(toggleHandler({ type: 'inlineMath' })),
    },

    link: {
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}link`)} />
      ),
      tooltip: t('link'),
      popoverRender: (exec, close) => (
        <FileInput
          onCancel={close}
          onOk={(data) => {
            if (data.type === 'file') {
              onInsertFile?.(data.file, {
                description: data.description,
                image: false,
              });
            } else {
              exec(
                toggleHandler({
                  type: 'link',
                  url: data.url,
                  description: data.description,
                }),
              );
            }
            close();
          }}
        />
      ),
    },

    math: {
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}math`)} />
      ),
      tooltip: t('math'),
      onClick: (exec) => exec(toggleHandler({ type: 'math' })),
    },

    // orderedList: {
    //   children: (
    //     <div
    //       className={classNames(`${prefix}icon`, `${iconPrefix}ordered-list`)}
    //     />
    //   ),
    // },

    redo: ({ history }) => ({
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}redo`)} />
      ),
      disabled: history.index === history.states.length - 1,
      tooltip: t('redo'),
      onClick: (exec) => exec(redoHandler()),
    }),

    strong: {
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}strong`)} />
      ),
      tooltip: t('strong'),
      onClick: (exec) => exec(toggleHandler({ type: 'strong' })),
    },

    // table: {
    //   children: (
    //     <div className={classNames(`${prefix}icon`, `${iconPrefix}table`)} />
    //   ),
    // },

    thematicBreak: {
      children: (
        <div
          className={classNames(`${prefix}icon`, `${iconPrefix}thematic-break`)}
        />
      ),
      tooltip: t('thematicBreak'),
      onClick: (exec) => exec(toggleHandler({ type: 'thematicBreak' })),
    },

    toHTML: {
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}to-html`)} />
      ),
      tooltip: t('toHTML'),
      onClick: (exec) =>
        exec(({ sourceCode, selection, dispatch }) =>
          dispatch({
            type: 'set',
            payload: {
              sourceCode: toHTML(sourceCode),
              selection: createSelection(0),
            },
            selection,
          }),
        ),
    },

    toMarkdown: {
      children: (
        <div
          className={classNames(`${prefix}icon`, `${iconPrefix}to-markdown`)}
        />
      ),
      tooltip: t('toMarkdown'),
      onClick: (exec) =>
        exec(({ sourceCode, selection, dispatch }) =>
          dispatch({
            type: 'set',
            payload: {
              sourceCode: toMarkdown(sourceCode),
              selection: createSelection(0),
            },
            selection,
          }),
        ),
    },

    undo: ({ history }) => ({
      children: (
        <div className={classNames(`${prefix}icon`, `${iconPrefix}undo`)} />
      ),
      disabled: !history.index,
      tooltip: t('undo'),
      onClick: (exec) => exec(undoHandler()),
    }),

    // unorderedList: {
    //   children: (
    //     <div
    //       className={classNames(`${prefix}icon`, `${iconPrefix}unordered-list`)}
    //     />
    //   ),
    // },
  };
};

export type ToolbarItems = (string | ToolbarItem)[][];

export const getDefaultToolbarItems = (): ToolbarItems => [
  ['heading', 'strong', 'emphasis', 'delete'],
  ['thematicBreak', 'blockquote'],
  // ['table', 'orderedList', 'unorderedList'],
  ['link', 'image'],
  ['inlineCode', 'code', 'inlineMath', 'math'],
  ['toMarkdown', 'toHTML'],
  ['undo', 'redo'],
  // ['fullscreen'],
];

interface ToolbarProps {
  className?: string;
  style?: React.CSSProperties;
  itemMap: Partial<Record<string, ToolbarItem>>;
  items: (string | ToolbarItem)[][];
  exec: Executor;
}

const Toolbar = ({ className, style, itemMap, items, exec }: ToolbarProps) => {
  const toolbarRef = useRef<HTMLDivElement>(null);

  const ctx = exec((ctx) => ctx);

  return (
    <div
      ref={toolbarRef}
      className={classNames(`${prefix}toolbar`, className)}
      style={style}
    >
      {items.map((group, index) => (
        <React.Fragment key={index}>
          {!!index && <div className={classNames(`${prefix}divider`)} />}
          {group.map((item, index) => {
            const toolbarItem = typeof item === 'string' ? itemMap[item] : item;
            if (!toolbarItem) {
              return undefined;
            }
            const { children, disabled, tooltip, popoverRender, onClick } =
              typeof toolbarItem === 'function'
                ? toolbarItem(ctx)
                : toolbarItem;
            return (
              <Button
                key={index}
                toolbarRef={toolbarRef}
                disabled={disabled}
                tooltip={tooltip}
                popoverRender={(close) => popoverRender?.(exec, close)}
                onClick={() => onClick?.(exec)}
              >
                {children}
              </Button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Toolbar;
