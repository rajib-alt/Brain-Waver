import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import { Search, Plus, BookmarkPlus, Network, Settings, PanelLeftClose, PanelLeft, Loader2, Hash, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NewNoteModal } from '@/components/NewNoteModal';
import { TagsView } from '@/components/TagsView';

export function AppHeader() {
  const navigate = useNavigate();
  const {
    setShowSettings, setShowGraph, setShowBookmark, showLeftPanel, setShowLeftPanel,
    showRightPanel, setShowRightPanel, searchQuery, setSearchQuery, isSaving, config,
  } = useApp();
  const [showNewNote, setShowNewNote] = useState(false);
  const [showTags, setShowTags] = useState(false);

  return (
    <>
      <header className="h-12 flex items-center gap-2 px-3 bg-panel shadow-panel z-20">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowLeftPanel(!showLeftPanel)}>
          {showLeftPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="h-8 pl-8 bg-secondary border-0 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}

          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowNewNote(true)} disabled={!config}>
            <Plus className="h-3.5 w-3.5" /> New Note
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowBookmark(true)} disabled={!config}>
            <BookmarkPlus className="h-3.5 w-3.5" /> Bookmark
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowTags(true)} disabled={!config}>
            <Hash className="h-3.5 w-3.5" /> Tags
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowGraph(true)} disabled={!config}>
            <Network className="h-3.5 w-3.5" /> Graph
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary hover:text-primary/80" onClick={() => navigate('/')}>
            <Brain className="h-3.5 w-3.5" /> Hub
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowRightPanel(!showRightPanel)}>
            <PanelLeft className="h-4 w-4 rotate-180" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <NewNoteModal open={showNewNote} onOpenChange={setShowNewNote} />
      <TagsView open={showTags} onOpenChange={setShowTags} />
    </>
  );
}
