import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import {
  Plus, MoreHorizontal, Pencil, Trash2, ArrowRight,
  Circle, Clock, CheckCircle2, AlertTriangle, ChevronDown,
  Zap, Compass, BookOpen, Archive,
} from 'lucide-react';
import type { ParaItem, ParaCategory, TaskStatus } from '@/store/useParaStore';

const CATEGORY_META: Record<ParaCategory, { label: string; icon: typeof Zap; color: string; desc: string }> = {
  projects: { label: 'Projects', icon: Zap, color: 'bg-primary/15 text-primary border-primary/20', desc: 'Active, actionable efforts' },
  areas: { label: 'Areas', icon: Compass, color: 'bg-accent/15 text-accent-foreground border-accent/20', desc: 'Ongoing responsibilities' },
  resources: { label: 'Resources', icon: BookOpen, color: 'bg-secondary text-secondary-foreground border-border', desc: 'Reference material' },
  archives: { label: 'Archives', icon: Archive, color: 'bg-muted text-muted-foreground border-border', desc: 'Completed & inactive' },
};

const STATUS_META: Record<TaskStatus, { label: string; icon: typeof Circle; color: string }> = {
  todo: { label: 'To Do', icon: Circle, color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-primary' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-green-500' },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-destructive/15 text-destructive border-destructive/20',
  medium: 'bg-primary/15 text-primary border-primary/20',
  low: 'bg-muted text-muted-foreground border-border',
};

interface KanbanBoardProps {
  items: ParaItem[];
  onEdit: (item: ParaItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onCategoryChange: (id: string, category: ParaCategory) => void;
  onAdd: (category: ParaCategory) => void;
  viewMode: 'category' | 'status';
}

function ItemCard({
  item, onEdit, onDelete, onStatusChange, onCategoryChange
}: {
  item: ParaItem;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: TaskStatus) => void;
  onCategoryChange: (c: ParaCategory) => void;
}) {
  const statusMeta = STATUS_META[item.status];
  const StatusIcon = statusMeta.icon;
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'done';

  return (
    <Card className="group hover:border-primary/20 transition-all duration-200 cursor-pointer" onClick={onEdit}>
      <CardContent className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <button
              className={`mt-0.5 shrink-0 ${statusMeta.color} hover:scale-110 transition-transform`}
              onClick={e => {
                e.stopPropagation();
                const next: TaskStatus = item.status === 'todo' ? 'in_progress' : item.status === 'in_progress' ? 'done' : 'todo';
                onStatusChange(next);
              }}
            >
              <StatusIcon className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium leading-tight ${item.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {item.title}
              </p>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={e => { e.stopPropagation(); onEdit(); }}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger><ArrowRight className="h-3.5 w-3.5 mr-2" /> Move to</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {(Object.keys(CATEGORY_META) as ParaCategory[])
                    .filter(c => c !== item.category)
                    .map(c => (
                      <DropdownMenuItem key={c} onClick={e => { e.stopPropagation(); onCategoryChange(c); }}>
                        {CATEGORY_META[c].label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger><Clock className="h-3.5 w-3.5 mr-2" /> Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {(Object.keys(STATUS_META) as TaskStatus[]).map(s => (
                    <DropdownMenuItem key={s} onClick={e => { e.stopPropagation(); onStatusChange(s); }}>
                      {STATUS_META[s].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${PRIORITY_COLORS[item.priority]}`}>
            {item.priority}
          </Badge>
          {isOverdue && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-destructive/10 text-destructive border-destructive/20 gap-0.5">
              <AlertTriangle className="h-2.5 w-2.5" /> overdue
            </Badge>
          )}
          {item.dueDate && !isOverdue && (
            <span className="text-[10px] text-muted-foreground">{new Date(item.dueDate).toLocaleDateString()}</span>
          )}
          {item.tags.slice(0, 2).map(t => (
            <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">#{t}</Badge>
          ))}
          {item.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{item.tags.length - 2}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export function KanbanBoard({ items, onEdit, onDelete, onStatusChange, onCategoryChange, onAdd, viewMode }: KanbanBoardProps) {
  const [collapsedCols, setCollapsedCols] = useState<Set<string>>(new Set());

  const toggleCollapse = (key: string) => {
    setCollapsedCols(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const columns = viewMode === 'category'
    ? (Object.keys(CATEGORY_META) as ParaCategory[]).map(cat => ({
        key: cat,
        label: CATEGORY_META[cat].label,
        desc: CATEGORY_META[cat].desc,
        icon: CATEGORY_META[cat].icon,
        color: CATEGORY_META[cat].color,
        items: items.filter(i => i.category === cat),
      }))
    : (Object.keys(STATUS_META) as TaskStatus[]).map(st => ({
        key: st,
        label: STATUS_META[st].label,
        desc: '',
        icon: STATUS_META[st].icon,
        color: '',
        items: items.filter(i => i.status === st),
      }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(col => {
        const ColIcon = col.icon;
        const collapsed = collapsedCols.has(col.key);
        return (
          <div key={col.key} className="flex flex-col min-h-0">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <button onClick={() => toggleCollapse(col.key)} className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`h-7 w-7 rounded-md flex items-center justify-center text-xs ${col.color || 'bg-secondary text-secondary-foreground'}`}>
                  <ColIcon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium text-foreground">{col.label}</span>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{col.items.length}</Badge>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground ml-auto transition-transform ${collapsed ? '-rotate-90' : ''}`} />
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => onAdd(viewMode === 'category' ? col.key as ParaCategory : 'projects')}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Column items */}
            {!collapsed && (
              <div className="space-y-2 flex-1">
                {col.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <p className="text-xs text-muted-foreground">No items yet</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-xs h-7 gap-1" onClick={() => onAdd(viewMode === 'category' ? col.key as ParaCategory : 'projects')}>
                      <Plus className="h-3 w-3" /> Add item
                    </Button>
                  </div>
                ) : (
                  col.items
                    .sort((a, b) => {
                      const prio = { high: 0, medium: 1, low: 2 };
                      if (prio[a.priority] !== prio[b.priority]) return prio[a.priority] - prio[b.priority];
                      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                    })
                    .map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onEdit={() => onEdit(item)}
                        onDelete={() => onDelete(item.id)}
                        onStatusChange={s => onStatusChange(item.id, s)}
                        onCategoryChange={c => onCategoryChange(item.id, c)}
                      />
                    ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
