import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Types
export interface NoteFile {
  path: string;
  name: string;
  sha?: string;
  content?: string;
  isFolder?: boolean;
  children?: NoteFile[];
  contentType?: string;
  annotation?: string;
  confidence?: number;
  influencedBy?: string[];
  sources?: string[];
}

export interface GitHubConfig {
  pat: string;
  username: string;
  repo: string;
}

export interface BacklinkMap {
  [notePath: string]: string[]; // notePath -> array of paths linking to it
}

export interface AppState {
  config: GitHubConfig | null;
  files: NoteFile[];
  currentFile: NoteFile | null;
  editorContent: string;
  tags: string[];
  backlinks: BacklinkMap;
  isLoading: boolean;
  isSaving: boolean;
  showSettings: boolean;
  showGraph: boolean;
  showBookmark: boolean;
  showRightPanel: boolean;
  showLeftPanel: boolean;
  showCommandPalette: boolean;
  searchQuery: string;
  aiSuggestions: { tags: string[]; folder: string } | null;
  isAiLoading: boolean;
  openRouterKey: string;
}

interface AppContextType extends AppState {
  setConfig: (config: GitHubConfig) => void;
  setCurrentFile: (file: NoteFile | null) => void;
  setEditorContent: (content: string) => void;
  setShowSettings: (show: boolean) => void;
  setShowGraph: (show: boolean) => void;
  setShowBookmark: (show: boolean) => void;
  setShowRightPanel: (show: boolean) => void;
  setShowLeftPanel: (show: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setAiSuggestions: (s: { tags: string[]; folder: string } | null) => void;
  setIsAiLoading: (loading: boolean) => void;
  setOpenRouterKey: (key: string) => void;
  fetchFiles: () => Promise<void>;
  loadFile: (path: string) => Promise<void>;
  saveFile: (path?: string, content?: string) => Promise<void>;
  createNote: (name: string, folder?: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  deleteFolder: (path: string) => Promise<void>;
  moveFile: (oldPath: string, newPath: string, content: string) => Promise<void>;
  getFileTree: () => string;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

// GitHub API helpers
const toBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
const fromBase64 = (str: string) => decodeURIComponent(escape(atob(str)));

// Frontmatter utilities
function parseFrontmatter(content: string): { frontmatter: any; body: string } {
  const lines = content.split('\n');
  if (lines[0] !== '---') return { frontmatter: {}, body: content };
  const endIndex = lines.findIndex((line, i) => i > 0 && line === '---');
  if (endIndex === -1) return { frontmatter: {}, body: content };
  const frontmatterStr = lines.slice(1, endIndex).join('\n');
  const body = lines.slice(endIndex + 1).join('\n');
  try {
    const frontmatter = frontmatterStr.trim() ? JSON.parse(frontmatterStr) : {};
    return { frontmatter, body };
  } catch {
    return { frontmatter: {}, body: content };
  }
}

function generateFrontmatter(frontmatter: any, body: string): string {
  if (Object.keys(frontmatter).length === 0) return body;
  const fmStr = JSON.stringify(frontmatter, null, 2);
  return `---\n${fmStr}\n---\n${body}`;
}

async function githubFetch(config: GitHubConfig, path: string, options?: RequestInit) {
  const url = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.pat}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error: ${res.status} ${err}`);
  }
  return res.json();
}

async function fetchTree(config: GitHubConfig): Promise<NoteFile[]> {
  const buildTree = async (path: string): Promise<NoteFile[]> => {
    const items = await githubFetch(config, path);
    const result: NoteFile[] = [];
    for (const item of items) {
      if (item.type === 'dir') {
        const children = await buildTree(item.path);
        result.push({ path: item.path, name: item.name, isFolder: true, children, sha: item.sha });
      } else if (item.name.endsWith('.md')) {
        result.push({ path: item.path, name: item.name, sha: item.sha });
      }
    }
    return result.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
  };
  try {
    return await buildTree('');
  } catch {
    return [];
  }
}

function extractAllTags(files: NoteFile[]): string[] {
  const tags = new Set<string>();
  const walk = (nodes: NoteFile[]) => {
    for (const n of nodes) {
      if (n.content) {
        const matches = n.content.match(/(?:^|\s)#([a-zA-Z0-9_-]+)/g);
        matches?.forEach(m => tags.add(m.trim().slice(1)));
      }
      if (n.children) walk(n.children);
    }
  };
  walk(files);
  return Array.from(tags).sort();
}

function buildBacklinks(files: NoteFile[]): BacklinkMap {
  const map: BacklinkMap = {};
  const allFiles: NoteFile[] = [];
  const walk = (nodes: NoteFile[]) => {
    for (const n of nodes) {
      if (!n.isFolder) allFiles.push(n);
      if (n.children) walk(n.children);
    }
  };
  walk(files);

  for (const file of allFiles) {
    if (!file.content) continue;
    const linkMatches = file.content.match(/\[\[([^\]]+)\]\]/g);
    if (!linkMatches) continue;
    for (const match of linkMatches) {
      const linkName = match.slice(2, -2).trim().toLowerCase();
      // Match by filename (case-insensitive), searching across all folders
      const target = allFiles.find(f => f.name.replace('.md', '').toLowerCase() === linkName);
      if (target) {
        if (!map[target.path]) map[target.path] = [];
        if (!map[target.path].includes(file.path)) {
          map[target.path].push(file.path);
        }
      }
    }
  }
  return map;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<GitHubConfig | null>(() => {
    const saved = localStorage.getItem('zettel-github-config');
    return saved ? JSON.parse(saved) : null;
  });
  const [files, setFiles] = useState<NoteFile[]>([]);
  const [currentFile, setCurrentFile] = useState<NoteFile | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [backlinks, setBacklinks] = useState<BacklinkMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showBookmark, setShowBookmark] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<{ tags: string[]; folder: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [openRouterKey, setOpenRouterKeyState] = useState(() => localStorage.getItem('zettel-openrouter-key') || '');

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setConfig = useCallback((c: GitHubConfig) => {
    setConfigState(c);
    localStorage.setItem('zettel-github-config', JSON.stringify(c));
  }, []);

  const setOpenRouterKey = useCallback((key: string) => {
    setOpenRouterKeyState(key);
    localStorage.setItem('zettel-openrouter-key', key);
  }, []);

  const fetchFiles = useCallback(async () => {
    if (!config) return;
    setIsLoading(true);
    try {
      const tree = await fetchTree(config);
      // Load content for all files
      const loadContent = async (nodes: NoteFile[]): Promise<NoteFile[]> => {
        const result: NoteFile[] = [];
        for (const node of nodes) {
          if (node.isFolder && node.children) {
            result.push({ ...node, children: await loadContent(node.children) });
          } else if (!node.isFolder) {
            try {
              const data = await githubFetch(config, node.path);
              const fullContent = fromBase64(data.content);
              const { frontmatter, body } = parseFrontmatter(fullContent);
              result.push({ 
                ...node, 
                content: body, 
                sha: data.sha,
                contentType: frontmatter.contentType,
                annotation: frontmatter.annotation,
                confidence: frontmatter.confidence,
                influencedBy: frontmatter.influencedBy,
                sources: frontmatter.sources,
              });
            } catch {
              result.push(node);
            }
          }
        }
        return result;
      };
      const loaded = await loadContent(tree);
      setFiles(loaded);
      setTags(extractAllTags(loaded));
      setBacklinks(buildBacklinks(loaded));
    } catch (e) {
      console.error('Failed to fetch files:', e);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const loadFile = useCallback(async (path: string) => {
    if (!config) return;
    try {
      const data = await githubFetch(config, path);
      const fullContent = fromBase64(data.content);
      const { frontmatter, body } = parseFrontmatter(fullContent);
      const file: NoteFile = { 
        path, 
        name: path.split('/').pop() || path, 
        content: body, 
        sha: data.sha,
        contentType: frontmatter.contentType,
        annotation: frontmatter.annotation,
        confidence: frontmatter.confidence,
        influencedBy: frontmatter.influencedBy,
        sources: frontmatter.sources,
      };
      setCurrentFile(file);
      setEditorContent(body);
    } catch (e) {
      console.error('Failed to load file:', e);
    }
  }, [config]);

  const saveFile = useCallback(async (path?: string, content?: string) => {
    if (!config) return;
    const filePath = path || currentFile?.path;
    const fileContent = content ?? editorContent;
    if (!filePath || !currentFile) return;
    
    setIsSaving(true);
    try {
      // Get current sha
      let sha: string | undefined;
      try {
        const existing = await githubFetch(config, filePath);
        sha = existing.sha;
      } catch { /* new file */ }

      const frontmatter = {
        contentType: currentFile.contentType,
        annotation: currentFile.annotation,
        confidence: currentFile.confidence,
        influencedBy: currentFile.influencedBy,
        sources: currentFile.sources,
      };
      const fullContent = generateFrontmatter(frontmatter, fileContent);

      await githubFetch(config, filePath, {
        method: 'PUT',
        body: JSON.stringify({
          message: `Update ${filePath}`,
          content: toBase64(fullContent),
          ...(sha ? { sha } : {}),
        }),
      });

      // Update local state
      if (currentFile && currentFile.path === filePath) {
        setCurrentFile({ ...currentFile, content: fileContent });
      }
    } catch (e) {
      console.error('Failed to save file:', e);
    } finally {
      setIsSaving(false);
    }
  }, [config, currentFile, editorContent]);

  const createNote = useCallback(async (name: string, folder?: string) => {
    if (!config) return;
    const path = folder ? `${folder}/${name}.md` : `${name}.md`;
    const content = `# ${name}\n\n`;
    await saveFile(path, content);
    await fetchFiles();
    await loadFile(path);
  }, [config, saveFile, fetchFiles, loadFile]);

  const deleteFile = useCallback(async (path: string) => {
    if (!config) return;
    try {
      const data = await githubFetch(config, path);
      await fetch(`https://api.github.com/repos/${config.username}/${config.repo}/contents/${path}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${config.pat}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: `Delete ${path}`, sha: data.sha }),
      });
      if (currentFile?.path === path) {
        setCurrentFile(null);
        setEditorContent('');
      }
      await fetchFiles();
    } catch (e) {
      console.error('Failed to delete file:', e);
    }
  }, [config, currentFile, fetchFiles]);

  const deleteFolder = useCallback(async (folderPath: string) => {
    if (!config) return;
    // Collect all files in the folder recursively
    const collectFiles = (nodes: NoteFile[], prefix: string): NoteFile[] => {
      const result: NoteFile[] = [];
      for (const n of nodes) {
        if (n.isFolder && n.children) {
          result.push(...collectFiles(n.children, n.path));
        } else if (!n.isFolder) {
          result.push(n);
        }
      }
      return result;
    };
    const findFolder = (nodes: NoteFile[]): NoteFile | undefined => {
      for (const n of nodes) {
        if (n.path === folderPath && n.isFolder) return n;
        if (n.isFolder && n.children) {
          const found = findFolder(n.children);
          if (found) return found;
        }
      }
    };
    const folder = findFolder(files);
    if (!folder || !folder.children) return;
    const allFiles = collectFiles(folder.children, folderPath);
    try {
      for (const file of allFiles) {
        const data = await githubFetch(config, file.path);
        await fetch(`https://api.github.com/repos/${config.username}/${config.repo}/contents/${file.path}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${config.pat}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: `Delete ${file.path} (folder cleanup)`, sha: data.sha }),
        });
      }
      if (currentFile && currentFile.path.startsWith(folderPath + '/')) {
        setCurrentFile(null);
        setEditorContent('');
      }
      await fetchFiles();
    } catch (e) {
      console.error('Failed to delete folder:', e);
    }
  }, [config, files, currentFile, fetchFiles]);

  const moveFile = useCallback(async (oldPath: string, newPath: string, content: string) => {
    if (!config) return;
    // Clear any pending auto-save to prevent recreating the old file
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    try {
      // 1. Create file at new path
      let newSha: string | undefined;
      try {
        const existing = await githubFetch(config, newPath);
        newSha = existing.sha;
      } catch { /* new file */ }
      await githubFetch(config, newPath, {
        method: 'PUT',
        body: JSON.stringify({
          message: `Move ${oldPath} to ${newPath}`,
          content: toBase64(content),
          ...(newSha ? { sha: newSha } : {}),
        }),
      });

      // 2. Delete old file
      const oldData = await githubFetch(config, oldPath);
      const deleteRes = await fetch(`https://api.github.com/repos/${config.username}/${config.repo}/contents/${oldPath}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${config.pat}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: `Delete ${oldPath} (moved to ${newPath})`, sha: oldData.sha }),
      });
      if (!deleteRes.ok) {
        console.error('Failed to delete original file:', await deleteRes.text());
      }

      // 3. Update state
      setCurrentFile(null);
      setEditorContent('');
      await fetchFiles();
      // Load the file at new path
      await loadFile(newPath);
    } catch (e) {
      console.error('Failed to move file:', e);
    }
  }, [config, fetchFiles, loadFile]);

  // Auto-save with debounce
  useEffect(() => {
    if (!currentFile || !config) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveFile();
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [editorContent]);

  // Load files on config change
  useEffect(() => {
    if (config) fetchFiles();
  }, [config]);

  const getFileTree = useCallback((): string => {
    const lines: string[] = [];
    const walk = (nodes: NoteFile[], indent = '') => {
      for (const n of nodes) {
        lines.push(`${indent}${n.isFolder ? '📁 ' : '📄 '}${n.name}`);
        if (n.children) walk(n.children, indent + '  ');
      }
    };
    walk(files);
    return lines.join('\n');
  }, [files]);

  return (
    <AppContext.Provider value={{
      config, files, currentFile, editorContent, tags, backlinks, isLoading, isSaving,
      showSettings, showGraph, showBookmark, showRightPanel, showLeftPanel, showCommandPalette, searchQuery,
      aiSuggestions, isAiLoading, openRouterKey,
      setConfig, setCurrentFile, setEditorContent, setShowSettings, setShowGraph,
      setShowBookmark, setShowRightPanel, setShowLeftPanel, setShowCommandPalette, setSearchQuery,
      setAiSuggestions, setIsAiLoading, setOpenRouterKey,
      fetchFiles, loadFile, saveFile, createNote, deleteFile, deleteFolder, moveFile, getFileTree,
    }}>
      {children}
    </AppContext.Provider>
  );
};
