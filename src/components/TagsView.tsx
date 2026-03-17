import { useApp, NoteFile } from '@/store/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Hash, FileText, ArrowLeft } from 'lucide-react';
import { useState, useMemo } from 'react';

function getAllFilesFlat(nodes: NoteFile[]): NoteFile[] {
  const result: NoteFile[] = [];
  for (const n of nodes) {
    if (n.isFolder && n.children) result.push(...getAllFilesFlat(n.children));
    else if (!n.isFolder) result.push(n);
  }
  return result;
}

function buildTagMap(files: NoteFile[]): Map<string, NoteFile[]> {
  const map = new Map<string, NoteFile[]>();
  const allFiles = getAllFilesFlat(files);
  for (const file of allFiles) {
    if (!file.content) continue;
    const matches = file.content.match(/(?:^|\s)#([a-zA-Z0-9_/-]+)/g);
    if (!matches) continue;
    const seen = new Set<string>();
    for (const m of matches) {
      const tag = m.trim().slice(1);
      if (seen.has(tag)) continue;
      seen.add(tag);
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(file);
    }
  }
  return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

export function TagsView({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { files, loadFile } = useApp();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tagMap = useMemo(() => buildTagMap(files), [files]);
  const tagEntries = useMemo(() => Array.from(tagMap.entries()), [tagMap]);

  const handleFileClick = (path: string) => {
    loadFile(path);
    onOpenChange(false);
    setSelectedTag(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSelectedTag(null); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-panel border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg flex items-center gap-2">
            {selectedTag ? (
              <>
                <button onClick={() => setSelectedTag(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <Hash className="h-4 w-4 text-primary" />
                {selectedTag}
                <Badge variant="secondary" className="ml-2 text-xs">{tagMap.get(selectedTag)?.length || 0} notes</Badge>
              </>
            ) : (
              <>
                <Hash className="h-4 w-4 text-primary" />
                Tags
                <Badge variant="secondary" className="ml-2 text-xs">{tagEntries.length} tags</Badge>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
          {!selectedTag ? (
            /* All tags grid */
            tagEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No tags found in your notes.</p>
            ) : (
              <div className="flex flex-wrap gap-2 p-1">
                {tagEntries.map(([tag, noteFiles]) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 hover:bg-primary/15 border border-border hover:border-primary/30 transition-all text-sm"
                  >
                    <Hash className="h-3 w-3 text-primary/70 group-hover:text-primary" />
                    <span className="text-foreground">{tag}</span>
                    <span className="text-[10px] text-muted-foreground ml-1 bg-muted px-1.5 py-0.5 rounded-full">{noteFiles.length}</span>
                  </button>
                ))}
              </div>
            )
          ) : (
            /* Notes for selected tag */
            <div className="space-y-1 p-1">
              {tagMap.get(selectedTag)?.map(file => (
                <button
                  key={file.path}
                  onClick={() => handleFileClick(file.path)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-left hover:bg-secondary/70 transition-colors group"
                >
                  <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground truncate">{file.name.replace('.md', '')}</div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">{file.path}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
