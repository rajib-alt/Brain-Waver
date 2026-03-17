import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function BookmarkModal() {
  const { showBookmark, setShowBookmark, saveFile, fetchFiles } = useApp();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const filename = title.trim().replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    const content = `# ${title.trim()}\n\n**URL:** ${url}\n\n**Saved:** ${new Date().toISOString().split('T')[0]}\n\n---\n\n${notes}\n\n#bookmark\n`;
    try {
      await saveFile(`Bookmarks/${filename}.md`, content);
      await fetchFiles();
      setUrl('');
      setTitle('');
      setNotes('');
      setShowBookmark(false);
    } catch (e) {
      console.error('Failed to save bookmark:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={showBookmark} onOpenChange={setShowBookmark}>
      <DialogContent className="bg-card shadow-elevated border-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bookmark</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">URL</Label>
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="bg-secondary border-0 text-sm font-mono-editor" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title" className="bg-secondary border-0 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Highlights / Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Key takeaways..." className="bg-secondary border-0 text-sm min-h-[100px]" />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={saving || !title.trim()}>
            {saving ? 'Saving...' : 'Save Bookmark'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
