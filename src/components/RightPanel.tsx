import { useApp, NoteFile } from '@/store/AppContext';
import { ArrowLeft, ArrowRight, Hash, Sparkles, Check, X, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

function flattenFiles(files: NoteFile[]): NoteFile[] {
  const result: NoteFile[] = [];
  const walk = (nodes: NoteFile[]) => {
    for (const n of nodes) {
      if (!n.isFolder) result.push(n);
      if (n.children) walk(n.children);
    }
  };
  walk(files);
  return result;
}

interface BacklinkWithContext {
  path: string;
  snippets: string[];
}

interface UnlinkedMention {
  path: string;
  snippets: string[];
}

export function RightPanel() {
  const {
    showRightPanel, currentFile, backlinks, files, loadFile,
    aiSuggestions, setAiSuggestions, editorContent, setEditorContent, moveFile,
    saveFile, fetchFiles, createNote,
  } = useApp();

  const allFiles = useMemo(() => flattenFiles(files), [files]);

  // Get forward links from current content
  const forwardLinks: string[] = [];
  if (editorContent) {
    const matches = editorContent.match(/\[\[([^\]]+)\]\]/g);
    matches?.forEach(m => forwardLinks.push(m.slice(2, -2)));
  }

  const currentName = currentFile?.name.replace('.md', '') || '';

  // Build backlinks with context snippets
  const backlinksWithContext = useMemo((): BacklinkWithContext[] => {
    if (!currentFile) return [];
    const paths = backlinks[currentFile.path] || [];
    return paths.map(path => {
      const file = allFiles.find(f => f.path === path);
      const snippets: string[] = [];
      if (file?.content) {
        const lines = file.content.split('\n');
        const regex = new RegExp(`\\[\\[${currentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\]`, 'gi');
        lines.forEach(line => {
          if (regex.test(line)) {
            snippets.push(line.trim());
            regex.lastIndex = 0;
          }
        });
      }
      return { path, snippets: snippets.slice(0, 3) };
    });
  }, [currentFile, backlinks, allFiles, currentName]);

  // Find unlinked mentions: plain text mentions of current note name (not inside [[ ]])
  const unlinkedMentions = useMemo((): UnlinkedMention[] => {
    if (!currentFile || !currentName) return [];
    const mentions: UnlinkedMention[] = [];
    const escapedName = currentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const plainRegex = new RegExp(`(?<!\\[\\[)\\b${escapedName}\\b(?!\\]\\])`, 'gi');
    const linkedRegex = new RegExp(`\\[\\[${escapedName}\\]\\]`, 'gi');

    for (const file of allFiles) {
      if (file.path === currentFile.path || !file.content) continue;
      // Skip files that already have a linked mention (they show in backlinks)
      const lines = file.content.split('\n');
      const snippets: string[] = [];
      for (const line of lines) {
        // Remove [[...]] portions, then check for plain mentions
        const lineWithoutLinks = line.replace(/\[\[[^\]]+\]\]/g, '');
        if (plainRegex.test(lineWithoutLinks)) {
          snippets.push(line.trim());
          plainRegex.lastIndex = 0;
        }
      }
      if (snippets.length > 0) {
        mentions.push({ path: file.path, snippets: snippets.slice(0, 3) });
      }
    }
    return mentions;
  }, [currentFile, currentName, allFiles]);

  // handleLinkMention uses saveFile/fetchFiles from the top-level useApp destructure
  const handleLinkMention = async (mentionPath: string) => {
    const file = allFiles.find(f => f.path === mentionPath);
    if (!file?.content) return;
    const escapedName = currentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!\\[\\[)\\b(${escapedName})\\b(?!\\]\\])`, 'i');
    const newContent = file.content.replace(regex, '[[' + currentName + ']]');
    if (newContent !== file.content) {
      await saveFile(mentionPath, newContent);
      await fetchFiles();
    }
  };

  const handleApplyTags = () => {
    if (!aiSuggestions) return;
    const tagString = aiSuggestions.tags.map(t => `#${t}`).join(' ');
    setEditorContent(editorContent + `\n\n---\n${tagString}`);
    setAiSuggestions(null);
  };

  const handleMoveToFolder = async () => {
    if (!aiSuggestions || !currentFile) return;
    const oldPath = currentFile.path;
    const newPath = `${aiSuggestions.folder}/${currentFile.name}`;
    await moveFile(oldPath, newPath, editorContent);
    setAiSuggestions(null);
  };

  if (!showRightPanel) return null;

  return (
    <aside className="w-64 flex-shrink-0 bg-panel shadow-panel flex flex-col overflow-hidden transition-panel">
      <div className="p-3 flex-1 overflow-y-auto scrollbar-thin space-y-4">
        {/* AI Suggestions */}
        {aiSuggestions && (
          <div className="bg-primary/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              <span className="font-medium">AI Suggestions</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {aiSuggestions.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-primary/10 rounded text-primary">
                    <Hash className="h-2.5 w-2.5" />{tag}
                  </span>
                ))}
              </div>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] mt-1 text-primary hover:bg-primary/10" onClick={handleApplyTags}>
                <Check className="h-3 w-3 mr-1" /> Apply Tags
              </Button>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Folder</p>
              <p className="text-xs text-foreground font-mono-editor">{aiSuggestions.folder}</p>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] mt-1 text-primary hover:bg-primary/10" onClick={handleMoveToFolder}>
                <Check className="h-3 w-3 mr-1" /> Move to Folder
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="h-6 text-[10px] w-full text-muted-foreground" onClick={() => setAiSuggestions(null)}>
              <X className="h-3 w-3 mr-1" /> Dismiss
            </Button>
          </div>
        )}

        {/* Linked Mentions (Backlinks) */}
        <div>
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1 flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Linked Mentions
            {backlinksWithContext.length > 0 && (
              <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">{backlinksWithContext.length}</span>
            )}
          </h3>
          {backlinksWithContext.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/60 px-1">No notes link here</p>
          ) : (
            <div className="space-y-2">
              {backlinksWithContext.map(({ path, snippets }) => (
                <div key={path} className="group">
                  <button
                    onClick={() => loadFile(path)}
                    className="flex items-center gap-1.5 w-full px-1.5 py-1 text-xs text-foreground hover:text-primary rounded-sm transition-colors font-medium"
                  >
                    <ArrowLeft className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate">{path.replace('.md', '').split('/').pop()}</span>
                  </button>
                  {snippets.length > 0 && (
                    <div className="ml-5 mt-0.5 space-y-0.5">
                      {snippets.map((s, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground leading-snug line-clamp-2 px-1 py-0.5 bg-secondary/50 rounded">
                          {highlightMention(s, currentName)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unlinked Mentions */}
        <div>
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1 flex items-center gap-1">
            <Link2 className="h-3 w-3" /> Unlinked Mentions
            {unlinkedMentions.length > 0 && (
              <span className="ml-auto text-[10px] bg-accent/50 text-accent-foreground px-1.5 rounded-full">{unlinkedMentions.length}</span>
            )}
          </h3>
          {unlinkedMentions.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/60 px-1">No unlinked mentions found</p>
          ) : (
            <div className="space-y-2">
              {unlinkedMentions.map(({ path, snippets }) => (
                <div key={path} className="group">
                  <div className="flex items-center gap-1 w-full px-1.5 py-1">
                    <button
                      onClick={() => loadFile(path)}
                      className="flex items-center gap-1.5 flex-1 text-xs text-foreground hover:text-primary rounded-sm transition-colors font-medium truncate"
                    >
                      <Link2 className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate">{path.replace('.md', '').split('/').pop()}</span>
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 px-1.5 text-[10px] text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleLinkMention(path)}
                    >
                      Link
                    </Button>
                  </div>
                  {snippets.length > 0 && (
                    <div className="ml-5 mt-0.5 space-y-0.5">
                      {snippets.map((s, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground leading-snug line-clamp-2 px-1 py-0.5 bg-secondary/50 rounded">
                          {highlightMention(s, currentName)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Forward Links */}
        <div>
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1 flex items-center gap-1">
            <ArrowRight className="h-3 w-3" /> Forward Links
            {forwardLinks.length > 0 && (
              <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">{forwardLinks.length}</span>
            )}
          </h3>
          {forwardLinks.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/60 px-1">
              No connections found. Link this note using <span className="font-mono-editor">[[ ]]</span>
            </p>
          ) : (
            forwardLinks.map(name => (
              <button key={name} onClick={async () => {
                const target = allFiles.find(f => f.name.replace('.md', '').toLowerCase() === name.toLowerCase());
                if (target) {
                  loadFile(target.path);
                } else {
                  // Auto-create the note if it doesn't exist
                  await createNote(name);
                }
              }} className="flex items-center gap-1.5 w-full px-1.5 py-1 text-xs text-muted-foreground hover:text-primary rounded-sm transition-colors">
                <ArrowRight className="h-3 w-3" />
                <span className="truncate">{name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

/** Highlight the note name within a snippet */
function highlightMention(text: string, name: string): React.ReactNode {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(\\[\\[)?${escaped}(\\]\\])?`, 'gi');
  const parts = text.split(regex);
  
  // Simple approach: just highlight the name wherever it appears
  const result: React.ReactNode[] = [];
  let remaining = text;
  let match: RegExpExecArray | null;
  const globalRegex = new RegExp(`(\\[\\[)?${escaped}(\\]\\])?`, 'gi');
  let lastIndex = 0;
  
  while ((match = globalRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      result.push(remaining.slice(lastIndex, match.index));
    }
    result.push(
      <span key={match.index} className="text-primary font-medium">{match[0]}</span>
    );
    lastIndex = globalRegex.lastIndex;
  }
  if (lastIndex < remaining.length) {
    result.push(remaining.slice(lastIndex));
  }
  return result.length > 0 ? result : text;
}
