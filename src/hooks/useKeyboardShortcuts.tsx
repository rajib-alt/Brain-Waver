import { useEffect } from 'react';
import { useApp } from '@/store/AppContext';

export function useKeyboardShortcuts() {
  const {
    setShowGraph, saveFile, currentFile, config,
    showCommandPalette, setShowCommandPalette,
  } = useApp();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        // Trigger new note via command palette
        setShowCommandPalette(true);
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (currentFile && config) saveFile();
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        if (config) setShowGraph(true);
      }
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setShowCommandPalette(!showCommandPalette);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentFile, config, showCommandPalette, setShowCommandPalette, setShowGraph, saveFile]);
}
