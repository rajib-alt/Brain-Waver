import { useApp, NoteFile } from '@/store/AppContext';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockEditor } from '@/components/BlockEditor';

export function EditorArea() {
  const {
    currentFile, editorContent, setEditorContent, config,
    openRouterKey, setAiSuggestions, isAiLoading, setIsAiLoading, getFileTree,
  } = useApp();

  const handleAiOrganize = async () => {
    if (!openRouterKey || !editorContent) return;
    setIsAiLoading(true);
    try {
      const fileTree = getFileTree();
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'stepfun/step-3.5-flash:free',
          messages: [
            {
              role: 'system',
              content: `You are an assistant organizing a Zettelkasten. You have access to the user's existing folder structure:\n\n${fileTree}\n\nRead the note text and suggest 3-5 relevant tags, and a suggested folder path. PREFER using existing folders from the structure above when appropriate. Only suggest new folders if no existing folder fits. Output strictly as JSON: { "tags": ["tag1", "tag2"], "folder": "Path/To/Folder" }.`,
            },
            { role: 'user', content: editorContent },
          ],
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAiSuggestions(JSON.parse(jsonMatch[0]));
      }
    } catch (e) {
      console.error('AI organize failed:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            {config ? 'Select a note or create a new one' : 'Architecture for your thoughts.'}
          </p>
          {!config && (
            <p className="text-muted-foreground/60 text-xs mt-2">Open Settings to connect your GitHub repository</p>
          )}
          <p className="text-muted-foreground/40 text-[10px] mt-4">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">Ctrl+K</kbd> Command Palette
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 bg-panel/50 border-b border-border/30">
        <span className="text-xs text-muted-foreground font-mono-editor truncate">{currentFile.path}</span>
        <div className="flex items-center gap-1">
          {openRouterKey && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
              onClick={handleAiOrganize}
              disabled={isAiLoading}
            >
              {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              AI Organize
            </Button>
          )}
        </div>
      </div>

      {/* BlockNote WYSIWYG Editor */}
      <BlockEditor
        content={editorContent}
        onChange={setEditorContent}
      />
    </div>
  );
}
