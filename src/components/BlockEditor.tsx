import { useEffect, useMemo, useRef } from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

interface BlockEditorProps {
  content: string;
  onChange: (markdown: string) => void;
}

export function BlockEditor({ content, onChange }: BlockEditorProps) {
  const isUpdatingRef = useRef(false);
  const lastContentRef = useRef(content);

  const editor = useCreateBlockNote({
    domAttributes: {
      editor: {
        class: 'blocknote-zettel',
      },
    },
  });

  // Load markdown content into editor when content changes externally
  useEffect(() => {
    if (isUpdatingRef.current) return;
    if (content === lastContentRef.current && editor.document.length > 1) return;
    lastContentRef.current = content;

    const load = async () => {
      try {
        const blocks = await editor.tryParseMarkdownToBlocks(content);
        editor.replaceBlocks(editor.document, blocks);
      } catch (e) {
        console.error('Failed to parse markdown:', e);
      }
    };
    load();
  }, [content, editor]);

  // Listen for changes and convert back to markdown
  const handleChange = async () => {
    try {
      isUpdatingRef.current = true;
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      lastContentRef.current = markdown;
      onChange(markdown);
    } catch (e) {
      console.error('Failed to convert to markdown:', e);
    } finally {
      isUpdatingRef.current = false;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="dark"
        data-theming-css-variables-demo
      />
    </div>
  );
}
