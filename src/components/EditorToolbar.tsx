import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Link, Image, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  onChange: (content: string) => void;
}

type FormatAction = {
  icon: React.ElementType;
  label: string;
  action: 'wrap' | 'prefix' | 'insert';
  before?: string;
  after?: string;
  prefix?: string;
  insert?: string;
};

const FORMAT_ACTIONS: (FormatAction | 'sep')[] = [
  { icon: Bold, label: 'Bold (Ctrl+B)', action: 'wrap', before: '**', after: '**' },
  { icon: Italic, label: 'Italic (Ctrl+I)', action: 'wrap', before: '_', after: '_' },
  { icon: Strikethrough, label: 'Strikethrough', action: 'wrap', before: '~~', after: '~~' },
  { icon: Code, label: 'Inline Code', action: 'wrap', before: '`', after: '`' },
  'sep',
  { icon: Heading1, label: 'Heading 1', action: 'prefix', prefix: '# ' },
  { icon: Heading2, label: 'Heading 2', action: 'prefix', prefix: '## ' },
  { icon: Heading3, label: 'Heading 3', action: 'prefix', prefix: '### ' },
  'sep',
  { icon: List, label: 'Bullet List', action: 'prefix', prefix: '- ' },
  { icon: ListOrdered, label: 'Numbered List', action: 'prefix', prefix: '1. ' },
  { icon: Quote, label: 'Blockquote', action: 'prefix', prefix: '> ' },
  { icon: Minus, label: 'Horizontal Rule', action: 'insert', insert: '\n---\n' },
  'sep',
  { icon: Link, label: 'Link', action: 'insert', insert: '[text](url)' },
  { icon: Image, label: 'Image', action: 'insert', insert: '![alt](url)' },
];

export function EditorToolbar({ textareaRef, content, onChange }: EditorToolbarProps) {
  const applyFormat = (fmt: FormatAction) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end);

    let newContent: string;
    let cursorPos: number;

    if (fmt.action === 'wrap') {
      const wrapped = `${fmt.before}${selected || 'text'}${fmt.after}`;
      newContent = content.slice(0, start) + wrapped + content.slice(end);
      cursorPos = selected ? start + wrapped.length : start + (fmt.before?.length || 0);
    } else if (fmt.action === 'prefix') {
      // Find start of line
      const lineStart = content.lastIndexOf('\n', start - 1) + 1;
      const line = content.slice(lineStart, end);
      // Toggle prefix
      if (line.startsWith(fmt.prefix!)) {
        newContent = content.slice(0, lineStart) + line.slice(fmt.prefix!.length) + content.slice(end);
        cursorPos = start - fmt.prefix!.length;
      } else {
        newContent = content.slice(0, lineStart) + fmt.prefix + content.slice(lineStart);
        cursorPos = start + fmt.prefix!.length;
      }
    } else {
      newContent = content.slice(0, start) + fmt.insert! + content.slice(end);
      cursorPos = start + fmt.insert!.length;
    }

    onChange(newContent);
    // Restore focus and cursor
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-9 flex items-center gap-0.5 px-2 bg-panel/50 border-b border-border/30 overflow-x-auto scrollbar-thin">
        {FORMAT_ACTIONS.map((item, i) => {
          if (item === 'sep') return <Separator key={i} orientation="vertical" className="h-5 mx-1" />;
          const Icon = item.icon;
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  onClick={() => applyFormat(item)}
                >
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
