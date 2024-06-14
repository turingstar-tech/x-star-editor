import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import SvgBlockquote from '../icons/Blockquote';
import SvgCode from '../icons/Code';
import SvgDelete from '../icons/Delete';
import SvgEmphasis from '../icons/Emphasis';
import SvgHeading from '../icons/Heading';
import SvgHelp from '../icons/Help';
import SvgImage from '../icons/Image';
import SvgInlineCode from '../icons/InlineCode';
import SvgInlineMath from '../icons/InlineMath';
import SvgLink from '../icons/Link';
import SvgMath from '../icons/Math';
import SvgMermaid from '../icons/Mermaid';
import SvgOrderedList from '../icons/OrderedList';
import SvgRedo from '../icons/Redo';
import SvgStrong from '../icons/Strong';
import SvgTable from '../icons/Table';
import SvgTaskList from '../icons/TaskList';
import SvgThematicBreak from '../icons/ThematicBreak';
import SvgToHTML from '../icons/ToHtml';
import SvgToMarkdown from '../icons/ToMarkdown';
import SvgUndo from '../icons/Undo';
import SvgUnorderedList from '../icons/UnorderedList';
import { getFormat } from '../locales';
import { prefix } from '../utils/global';
import type { Executor, Handler } from '../utils/handler';
import { redoHandler, toggleHandler, undoHandler } from '../utils/handler';
import { toHTML, toMarkdown } from '../utils/markdown';
import Fade from './Fade';
import FileInput from './FileInput';

interface ItemProps {
  children: React.ReactNode;
  toolbarRef: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
  tooltip?: React.ReactNode;
  popoverRender?: (close: () => void) => React.ReactNode;
  onClick?: () => void;
}

const Item = ({
  children,
  toolbarRef,
  disabled,
  tooltip,
  popoverRender,
  onClick,
}: ItemProps) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const popover = popoverRender?.(() => setPopoverOpen(false));
  const popoverMount = !!popover && popoverOpen;
  const tooltipMount = !popoverMount && !!tooltip && tooltipOpen;

  const tooltipRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (popoverMount) {
      if (
        toolbarRef.current &&
        popoverRef.current &&
        !popoverRef.current.style.left
      ) {
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

      document.addEventListener('click', listener, { capture: true });
      return () =>
        document.removeEventListener('click', listener, { capture: true });
    }
  }, [popoverMount]);

  return (
    <div className={classNames(`${prefix}-item-container`)}>
      <div
        className={classNames(`${prefix}-item`, {
          [`${prefix}-disabled`]: disabled,
          [`${prefix}-active`]: popoverMount,
        })}
        onClick={() => {
          if (!disabled) {
            setTooltipOpen(false);
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
        <div ref={tooltipRef} className={classNames(`${prefix}-tooltip`)}>
          {tooltip}
        </div>
      </Fade>
      <Fade nodeRef={popoverRef} appear={popoverMount} timeout={300}>
        <div ref={popoverRef} className={classNames(`${prefix}-popover`)}>
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

export type ToolbarItem = ToolbarItemProps | Handler<ToolbarItemProps>;

const codeOptions = [
  { label: 'C++', lang: 'cpp' },
  { label: 'Java', lang: 'java' },
  { label: 'Python', lang: 'py' },
  { label: 'Text', lang: 'txt' },
] as const;

const headingOptions = [
  { depth: 1, fontSize: '1.6em' },
  { depth: 2, fontSize: '1.3em' },
  { depth: 3, fontSize: '1.2em' },
  { depth: 4, fontSize: '1.1em' },
  { depth: 5, fontSize: '1em' },
  { depth: 6, fontSize: '0.9em' },
] as const;

const getMermaidOptions = (locale?: string) => {
  const t = getFormat(locale, 'mermaid');

  return [
    {
      label: t('flowchart'),
      value: `flowchart TD
      A[Start] --> B{Is it?}
      B -- Yes --> C[OK]
      C --> D[Rethink]
      D --> B
      B -- No ----> E[End]`,
    },
    {
      label: t('sequenceDiagram'),
      value: `sequenceDiagram
      Alice->>John: Hello John, how are you?
      John-->>Alice: Great!
      Alice-)John: See you later!`,
    },
    {
      label: t('classDiagram'),
      value: `classDiagram
      Animal <|-- Duck
      Animal <|-- Fish
      Animal <|-- Zebra
      Animal : +int age
      Animal : +String gender
      Animal: +isMammal()
      Animal: +mate()
      class Duck{
        +String beakColor
        +swim()
        +quack()
      }
      class Fish{
        -int sizeInFeet
        -canEat()
      }
      class Zebra{
        +bool is_wild
        +run()
      }`,
    },
    {
      label: t('stateDiagram'),
      value: `stateDiagram-v2
      [*] --> Still
      Still --> [*]
  
      Still --> Moving
      Moving --> Still
      Moving --> Crash
      Crash --> [*]`,
    },
    {
      label: t('entityRelationshipDiagram'),
      value: `erDiagram
      CUSTOMER ||--o{ ORDER : places
      ORDER ||--|{ LINE-ITEM : contains
      CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
    },
    {
      label: t('userJourney'),
      value: `journey
      title My working day
      section Go to work
        Make tea: 5: Me
        Go upstairs: 3: Me
        Do work: 1: Me, Cat
      section Go home
        Go downstairs: 5: Me
        Sit down: 5: Me`,
    },
    {
      label: t('gantt'),
      value: `gantt
      title A Gantt Diagram
      dateFormat YYYY-MM-DD
      section Section
          A task          :a1, 2014-01-01, 30d
          Another task    :after a1, 20d
      section Another
          Task in Another :2014-01-12, 12d
          another task    :24d`,
    },
    {
      label: t('pieChart'),
      value: `pie title Pets adopted by volunteers
      "Dogs" : 386
      "Cats" : 85
      "Rats" : 15`,
    },
    {
      label: t('quadrantChart'),
      value: `quadrantChart
      title Reach and engagement of campaigns
      x-axis Low Reach --> High Reach
      y-axis Low Engagement --> High Engagement
      quadrant-1 We should expand
      quadrant-2 Need to promote
      quadrant-3 Re-evaluate
      quadrant-4 May be improved
      Campaign A: [0.3, 0.6]
      Campaign B: [0.45, 0.23]
      Campaign C: [0.57, 0.69]
      Campaign D: [0.78, 0.34]
      Campaign E: [0.40, 0.34]
      Campaign F: [0.35, 0.78]`,
    },
    {
      label: t('requirementDiagram'),
      value: `requirementDiagram
  
      requirement test_req {
      id: 1
      text: the test text.
      risk: high
      verifymethod: test
      }
  
      element test_entity {
      type: simulation
      }
  
      test_entity - satisfies -> test_req`,
    },
    {
      label: t('gitgraphDiagram'),
      value: `gitGraph
     commit
     commit
     branch develop
     checkout develop
     commit
     commit
     checkout main
     merge develop
     commit
     commit`,
    },
    {
      label: t('mindmap'),
      value: `mindmap
    root((mindmap))
      Origins
        Long history
        ::icon(fa fa-book)
        Popularisation
          British popular psychology author Tony Buzan
      Research
        On effectiveness<br/>and features
        On Automatic creation
          Uses
              Creative techniques
              Strategic planning
              Argument mapping
      Tools
        Pen and paper
        Mermaid`,
    },
    {
      label: t('timeline'),
      value: `timeline
      title History of Social Media Platform
      2002 : LinkedIn
      2004 : Facebook
           : Google
      2005 : Youtube
      2006 : Twitter`,
    },
  ] as const;
};

export type ToolbarItemMap = Partial<Record<string, ToolbarItem>>;

export const getDefaultToolbarItemMap = (
  locale?: string,
  onInsertFile?: (
    file: File,
    options: { description: string; image: boolean },
  ) => void,
): ToolbarItemMap => {
  const t = getFormat(locale, 'toolbarItem');

  return {
    blockquote: {
      children: <SvgBlockquote className={classNames(`${prefix}-icon`)} />,
      tooltip: t('blockquote'),
      onClick: (exec) => exec(toggleHandler({ type: 'blockquote' })),
    },

    code: {
      children: <SvgCode className={classNames(`${prefix}-icon`)} />,
      tooltip: t('code'),
      popoverRender: (exec, close) =>
        codeOptions.map(({ label, lang }) => (
          <div
            key={label}
            className={classNames(`${prefix}-option`)}
            onClick={() => {
              exec(
                toggleHandler({
                  type: 'code',
                  lang,
                  value: '',
                  showLineNumbers: true,
                }),
              );
              close();
            }}
          >
            {label}
          </div>
        )),
    },

    delete: {
      children: <SvgDelete className={classNames(`${prefix}-icon`)} />,
      tooltip: t('delete'),
      onClick: (exec) => exec(toggleHandler({ type: 'delete' })),
    },

    emphasis: {
      children: <SvgEmphasis className={classNames(`${prefix}-icon`)} />,
      tooltip: t('emphasis'),
      onClick: (exec) => exec(toggleHandler({ type: 'emphasis' })),
    },

    heading: {
      children: <SvgHeading className={classNames(`${prefix}-icon`)} />,
      tooltip: t('heading'),
      popoverRender: (exec, close) =>
        headingOptions.map(({ depth, fontSize }) => (
          <div
            key={depth}
            className={classNames(`${prefix}-option`)}
            style={{ fontSize }}
            onClick={() => {
              exec(toggleHandler({ type: 'heading', depth }));
              close();
            }}
          >
            H{depth} {t('heading')} {depth}
          </div>
        )),
    },

    help: {
      children: <SvgHelp className={classNames(`${prefix}-icon`)} />,
      tooltip: t('help'),
    },

    image: {
      children: <SvgImage className={classNames(`${prefix}-icon`)} />,
      tooltip: t('image'),
      popoverRender: (exec, close) => (
        <FileInput
          image
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
      children: <SvgInlineCode className={classNames(`${prefix}-icon`)} />,
      tooltip: t('inlineCode'),
      onClick: (exec) => exec(toggleHandler({ type: 'inlineCode' })),
    },

    inlineMath: {
      children: <SvgInlineMath className={classNames(`${prefix}-icon`)} />,
      tooltip: t('inlineMath'),
      onClick: (exec) => exec(toggleHandler({ type: 'inlineMath' })),
    },

    link: {
      children: <SvgLink className={classNames(`${prefix}-icon`)} />,
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
      children: <SvgMath className={classNames(`${prefix}-icon`)} />,
      tooltip: t('math'),
      onClick: (exec) => exec(toggleHandler({ type: 'math' })),
    },

    mermaid: {
      children: <SvgMermaid className={classNames(`${prefix}-icon`)} />,
      tooltip: t('mermaid'),
      popoverRender: (exec, close) =>
        getMermaidOptions(locale).map(({ label, value }) => (
          <div
            key={label}
            className={classNames(`${prefix}-option`)}
            onClick={() => {
              exec(
                toggleHandler({
                  type: 'code',
                  lang: 'mermaid',
                  value,
                  showLineNumbers: false,
                }),
              );
              close();
            }}
          >
            {label}
          </div>
        )),
    },

    orderedList: {
      children: <SvgOrderedList className={classNames(`${prefix}-icon`)} />,
      tooltip: t('orderedList'),
      onClick: (exec) => exec(toggleHandler({ type: 'orderedList' })),
    },

    redo: ({ history }) => ({
      children: <SvgRedo className={classNames(`${prefix}-icon`)} />,
      disabled: history.index === history.states.length - 1,
      tooltip: t('redo'),
      onClick: (exec) => exec(redoHandler()),
    }),

    strong: {
      children: <SvgStrong className={classNames(`${prefix}-icon`)} />,
      tooltip: t('strong'),
      onClick: (exec) => exec(toggleHandler({ type: 'strong' })),
    },

    table: {
      children: <SvgTable className={classNames(`${prefix}-icon`)} />,
      tooltip: t('table'),
      onClick: (exec) => exec(toggleHandler({ type: 'table' })),
    },

    taskList: {
      children: <SvgTaskList className={classNames(`${prefix}-icon`)} />,
      tooltip: t('taskList'),
      onClick: (exec) => exec(toggleHandler({ type: 'taskList' })),
    },

    thematicBreak: {
      children: <SvgThematicBreak className={classNames(`${prefix}-icon`)} />,
      tooltip: t('thematicBreak'),
      onClick: (exec) => exec(toggleHandler({ type: 'thematicBreak' })),
    },

    toHTML: {
      children: <SvgToHTML className={classNames(`${prefix}-icon`)} />,
      tooltip: t('toHTML'),
      onClick: (exec) =>
        exec(({ sourceCode, selection, dispatch }) =>
          dispatch({
            type: 'set',
            payload: { sourceCode: toHTML(sourceCode), selection },
            selection,
          }),
        ),
    },

    toMarkdown: {
      children: <SvgToMarkdown className={classNames(`${prefix}-icon`)} />,
      tooltip: t('toMarkdown'),
      onClick: (exec) =>
        exec(({ sourceCode, selection, dispatch }) =>
          dispatch({
            type: 'set',
            payload: { sourceCode: toMarkdown(sourceCode), selection },
            selection,
          }),
        ),
    },

    undo: ({ history }) => ({
      children: <SvgUndo className={classNames(`${prefix}-icon`)} />,
      disabled: !history.index,
      tooltip: t('undo'),
      onClick: (exec) => exec(undoHandler()),
    }),

    unorderedList: {
      children: <SvgUnorderedList className={classNames(`${prefix}-icon`)} />,
      tooltip: t('unorderedList'),
      onClick: (exec) => exec(toggleHandler({ type: 'unorderedList' })),
    },
  };
};

export type ToolbarItems = (string | ToolbarItem)[][];

export const getDefaultToolbarItems = (): ToolbarItems => [
  ['heading', 'strong', 'emphasis', 'delete'],
  ['thematicBreak', 'blockquote', 'table'],
  ['link', 'image', 'mermaid'],
  ['inlineCode', 'code', 'inlineMath', 'math'],
  ['orderedList', 'unorderedList', 'taskList'],
  ['toMarkdown', 'toHTML'],
  ['undo', 'redo'],
  // ['help'],
];

interface ToolbarProps {
  className?: string;
  style?: React.CSSProperties;
  itemMap: ToolbarItemMap;
  items: ToolbarItems;
  exec: Executor;
}

const Toolbar = ({ className, style, itemMap, items, exec }: ToolbarProps) => {
  const toolbarRef = useRef<HTMLDivElement>(null);

  const ctx = exec((ctx) => ctx);

  return (
    <div
      ref={toolbarRef}
      className={classNames(`${prefix}-toolbar`, className)}
      style={style}
    >
      {items.map((group, index) => (
        <React.Fragment key={index}>
          {!!index && <div className={classNames(`${prefix}-divider`)} />}
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
              <Item
                key={index}
                toolbarRef={toolbarRef}
                disabled={disabled}
                tooltip={tooltip}
                popoverRender={(close) => popoverRender?.(exec, close)}
                onClick={() => onClick?.(exec)}
              >
                {children}
              </Item>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Toolbar;
