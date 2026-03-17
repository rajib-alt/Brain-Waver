import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useApp } from '@/store/AppContext';
import { cn } from '@/lib/utils';

export function DailyNotesCalendar() {
  const { saveFile, fetchFiles, loadFile, files, config } = useApp();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  if (!config) return null;

  const flatFiles: string[] = [];
  const walk = (nodes: typeof files) => {
    for (const n of nodes) {
      if (!n.isFolder) flatFiles.push(n.path);
      if (n.children) walk(n.children);
    }
  };
  walk(files);

  const dailyNoteDates = new Set(
    flatFiles
      .filter(p => p.startsWith('Daily/'))
      .map(p => p.replace('Daily/', '').replace('.md', ''))
  );

  const handleSelectDate = async (selected: Date | undefined) => {
    if (!selected) return;
    setDate(selected);
    const dateStr = format(selected, 'yyyy-MM-dd');
    const path = `Daily/${dateStr}.md`;

    if (flatFiles.includes(path)) {
      await loadFile(path);
    } else {
      const dayName = format(selected, 'EEEE, MMMM do, yyyy');
      const content = `---\ncreated: ${dateStr}\ncategories:\n  - daily\n---\n\n# ${dayName}\n\n`;
      await saveFile(path, content);
      await fetchFiles();
      await loadFile(path);
    }
  };

  const handleTodayClick = () => {
    handleSelectDate(new Date());
  };

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        <CalendarIcon className="h-3 w-3" />
        <span>Daily Notes</span>
        <ChevronDown className={cn("h-3 w-3 ml-auto transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-1 mt-1">
          <button
            onClick={handleTodayClick}
            className="w-full mb-1.5 px-2 py-1 text-[10px] bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors font-medium"
          >
            Open Today's Note
          </button>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelectDate}
            className={cn("p-1 pointer-events-auto w-full [&_.rdp-caption]:text-[10px] [&_.rdp-head_cell]:text-[10px] [&_.rdp-cell]:text-[10px] [&_.rdp-button]:h-6 [&_.rdp-button]:w-6 [&_.rdp-button]:text-[10px] [&_.rdp-nav_button]:h-5 [&_.rdp-nav_button]:w-5")}
            modifiers={{
              hasNote: (day) => dailyNoteDates.has(format(day, 'yyyy-MM-dd')),
            }}
            modifiersClassNames={{
              hasNote: 'bg-primary/20 font-bold text-primary',
            }}
          />
        </div>
      )}
    </div>
  );
}
