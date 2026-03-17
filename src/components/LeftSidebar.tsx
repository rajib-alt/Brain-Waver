import { useApp, NoteFile } from '@/store/AppContext';
import { FileText, ChevronRight, FolderOpen, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DailyNotesCalendar } from '@/components/DailyNotesCalendar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

function FileTreeItem({ node, depth = 0 }: { node: NoteFile; depth?: number }) {
  const { loadFile, currentFile, deleteFile, deleteFolder } = useApp();
  const [open, setOpen] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isActive = currentFile?.path === node.path;

  if (node.isFolder) {
    return (
      <div>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1.5 w-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-sm transition-panel"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <ChevronRight className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`} />
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="truncate">{node.name}</span>
            </button>
          </ContextMenuTrigger>
          <ContextMenuContent className="bg-panel border-border">
            <ContextMenuItem className="text-destructive focus:text-destructive gap-2 text-xs" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {open && node.children?.map(child => (
          <FileTreeItem key={child.path} node={child} depth={depth + 1} />
        ))}
        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          itemName={node.name}
          itemType="folder"
          onConfirm={() => deleteFolder(node.path)}
        />
      </div>
    );
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            onClick={() => loadFile(node.path)}
            className={`flex items-center gap-1.5 w-full px-2 py-1 text-xs rounded-sm transition-panel ${
              isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{node.name.replace('.md', '')}</span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-panel border-border">
          <ContextMenuItem className="text-destructive focus:text-destructive gap-2 text-xs" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete file
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={node.name.replace('.md', '')}
        itemType="file"
        onConfirm={() => deleteFile(node.path)}
      />
    </>
  );
}

export function LeftSidebar() {
  const { files, isLoading, showLeftPanel, searchQuery } = useApp();

  if (!showLeftPanel) return null;

  const filterFiles = (nodes: NoteFile[]): NoteFile[] => {
    if (!searchQuery) return nodes;
    return nodes.reduce<NoteFile[]>((acc, node) => {
      if (node.isFolder && node.children) {
        const filtered = filterFiles(node.children);
        if (filtered.length > 0) acc.push({ ...node, children: filtered });
      } else if (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 node.content?.toLowerCase().includes(searchQuery.toLowerCase())) {
        acc.push(node);
      }
      return acc;
    }, []);
  };

  const filteredFiles = filterFiles(files);

  return (
    <aside className="w-56 flex-shrink-0 bg-panel shadow-panel flex flex-col overflow-hidden transition-panel">
      <div className="p-3 flex-1 overflow-y-auto scrollbar-thin">
        <DailyNotesCalendar />
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8">
            Configure GitHub in Settings to get started
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-2">Files</h3>
            {filteredFiles.map(node => (
              <FileTreeItem key={node.path} node={node} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
