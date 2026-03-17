import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { ParaCategory, TaskStatus, TaskPriority, ParaItem } from '@/store/useParaStore';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: {
    title: string;
    description: string;
    category: ParaCategory;
    status: TaskStatus;
    priority: TaskPriority;
    tags: string[];
    linkedNotes: string[];
    dueDate?: string;
  }) => void;
  editItem?: ParaItem | null;
  defaultCategory?: ParaCategory;
}

export function TaskModal({ open, onOpenChange, onSave, editItem, defaultCategory = 'projects' }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ParaCategory>(defaultCategory);
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (open) {
      if (editItem) {
        setTitle(editItem.title);
        setDescription(editItem.description);
        setCategory(editItem.category);
        setStatus(editItem.status);
        setPriority(editItem.priority);
        setTags(editItem.tags);
        setDueDate(editItem.dueDate || '');
      } else {
        setTitle('');
        setDescription('');
        setCategory(defaultCategory);
        setStatus('todo');
        setPriority('medium');
        setTags([]);
        setDueDate('');
      }
    }
  }, [open, editItem, defaultCategory]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
    }
    setTagInput('');
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      priority,
      tags,
      linkedNotes: editItem?.linkedNotes || [],
      ...(dueDate ? { dueDate } : {}),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-panel border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">{editItem ? 'Edit Item' : 'New Item'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="bg-secondary border-border font-medium"
            autoFocus
          />
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="bg-secondary border-border min-h-[80px] resize-none"
          />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <Select value={category} onValueChange={v => setCategory(v as ParaCategory)}>
                <SelectTrigger className="bg-secondary border-border h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="areas">Areas</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                  <SelectItem value="archives">Archives</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={status} onValueChange={v => setStatus(v as TaskStatus)}>
                <SelectTrigger className="bg-secondary border-border h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
              <Select value={priority} onValueChange={v => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-secondary border-border h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="bg-secondary border-border h-9 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag..."
                className="bg-secondary border-border h-9 text-sm flex-1"
              />
              <Button variant="outline" size="sm" onClick={addTag} className="h-9">Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="gap-1 text-xs">
                    #{t}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setTags(prev => prev.filter(x => x !== t))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {editItem ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
