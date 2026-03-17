import { useApp } from '@/store/AppContext';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FileText, Hash, Plus, Network, Settings, BookmarkPlus, Save } from 'lucide-react';
import { useState } from 'react';

export function CommandPalette() {
  const {
    showCommandPalette, setShowCommandPalette, files, tags,
    loadFile, setShowGraph, setShowSettings, setShowBookmark,
    createNote, saveFile, currentFile, config,
  } = useApp();
  const [search, setSearch] = useState('');

  const allFiles: { path: string; name: string }[] = [];
  const walk = (nodes: typeof files) => {
    for (const n of nodes) {
      if (n.isFolder && n.children) walk(n.children);
      else if (!n.isFolder) allFiles.push({ path: n.path, name: n.name });
    }
  };
  walk(files);

  const handleSelect = (action: string) => {
    setShowCommandPalette(false);
    setSearch('');
    if (action.startsWith('file:')) {
      loadFile(action.slice(5));
    } else if (action === 'new-note') {
      const name = search.trim() || 'Untitled';
      if (config) createNote(name);
    } else if (action === 'graph') setShowGraph(true);
    else if (action === 'settings') setShowSettings(true);
    else if (action === 'bookmark') setShowBookmark(true);
    else if (action === 'save' && currentFile) saveFile();
  };

  return (
    <CommandDialog open={showCommandPalette} onOpenChange={(open) => { setShowCommandPalette(open); if (!open) setSearch(''); }}>
      <CommandInput placeholder="Search notes, tags, or actions..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>
          {search.trim() && config ? (
            <button
              className="flex items-center gap-2 w-full px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => handleSelect('new-note')}
            >
              <Plus className="h-4 w-4" /> Create note "{search.trim()}"
            </button>
          ) : (
            'No results found.'
          )}
        </CommandEmpty>

        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => handleSelect('new-note')}>
            <Plus className="mr-2 h-4 w-4" /> New Note
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+N</span>
          </CommandItem>
          {currentFile && (
            <CommandItem onSelect={() => handleSelect('save')}>
              <Save className="mr-2 h-4 w-4" /> Save
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+S</span>
            </CommandItem>
          )}
          <CommandItem onSelect={() => handleSelect('graph')}>
            <Network className="mr-2 h-4 w-4" /> Graph View
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+G</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('bookmark')}>
            <BookmarkPlus className="mr-2 h-4 w-4" /> Add Bookmark
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('settings')}>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </CommandItem>
        </CommandGroup>

        {/* Notes */}
        {allFiles.length > 0 && (
          <CommandGroup heading="Notes">
            {allFiles.map(f => (
              <CommandItem key={f.path} onSelect={() => handleSelect(`file:${f.path}`)}>
                <FileText className="mr-2 h-4 w-4" /> {f.name.replace('.md', '')}
                <span className="ml-auto text-xs text-muted-foreground font-mono">{f.path}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <CommandGroup heading="Tags">
            {tags.map(tag => (
              <CommandItem key={tag} value={`tag:${tag}`} onSelect={() => { setShowCommandPalette(false); }}>
                <Hash className="mr-2 h-4 w-4" /> #{tag}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
