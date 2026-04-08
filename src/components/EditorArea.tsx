import { useApp, NoteFile } from '@/store/AppContext';
import { Sparkles, Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockEditor } from '@/components/BlockEditor';

export function EditorArea() {
  const {
    currentFile, setCurrentFile, editorContent, setEditorContent, config,
    openRouterKey, setAiSuggestions, isAiLoading, setIsAiLoading, getFileTree, files,
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
              content: `You are an AI assistant for a spatial note-taking app. Analyze the note content and classify it into one of these types: claim, question, task, idea, entity, reference, quote, definition, opinion, reflection, narrative, comparison, thesis, general.

For the type, provide:
- contentType: the type name
- annotation: a 2-4 sentence insight that adds new value (not a summary)
- confidence: a number 0-1 indicating certainty

Also suggest 3-5 relevant tags and a folder path.

Output strictly as JSON: { "contentType": "idea", "annotation": "text", "confidence": 0.8, "tags": ["tag1", "tag2"], "folder": "Path/To/Folder" }.

Existing structure:\n${fileTree}`,
            },
            { role: 'user', content: editorContent },
          ],
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiResult = JSON.parse(jsonMatch[0]);
        setAiSuggestions({ tags: aiResult.tags, folder: aiResult.folder });
        // Update current file with AI metadata
        if (currentFile) {
          setCurrentFile({
            ...currentFile,
            contentType: aiResult.contentType,
            annotation: aiResult.annotation,
            confidence: aiResult.confidence,
          });
        }
      }
    } catch (e) {
      console.error('AI organize failed:', e);
    } finally {
      setIsAiLoading(false);
    }
  const handleFindConnections = async () => {
    if (!openRouterKey || !editorContent || !currentFile) return;
    setIsAiLoading(true);
    try {
      const allNotes = files.flatMap(f => f.isFolder ? f.children || [] : [f]).filter(f => !f.isFolder && f.content);
      const otherNotes = allNotes.filter(f => f.path !== currentFile.path).slice(0, 10); // Limit to 10 for context
      const notesContext = otherNotes.map(f => `${f.name}: ${f.content?.slice(0, 200)}...`).join('\n\n');

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
              content: `Analyze the current note and find connections to other notes. Look for shared topics, contradictions, dependencies, or related ideas.

Current note: ${editorContent}

Other notes:
${notesContext}

Output JSON with array of connected note paths: { "connections": ["path/to/note1.md", "path/to/note2.md"] }`,
            },
            { role: 'user', content: 'Find meaningful connections between this note and others.' },
          ],
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        setCurrentFile({
          ...currentFile,
          influencedBy: result.connections,
        });
      }
    } catch (e) {
      console.error('AI connections failed:', e);
    } finally {
      setIsAiLoading(false);
    }
  };
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
            <>
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
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                onClick={handleFindConnections}
                disabled={isAiLoading}
              >
                {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Link2 className="h-3 w-3" />}
                Find Connections
              </Button>
            </>
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
