import { useState, useCallback, useEffect } from 'react';

export type ParaCategory = 'projects' | 'areas' | 'resources' | 'archives';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ParaItem {
  id: string;
  title: string;
  description: string;
  category: ParaCategory;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  linkedNotes: string[]; // note paths
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

const STORAGE_KEY = 'zettel-para-items';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadItems(): ParaItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function persistItems(items: ParaItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useParaStore() {
  const [items, setItems] = useState<ParaItem[]>(loadItems);

  useEffect(() => {
    persistItems(items);
  }, [items]);

  const addItem = useCallback((data: Omit<ParaItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const item: ParaItem = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    setItems(prev => [...prev, item]);
    return item;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Omit<ParaItem, 'id' | 'createdAt'>>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    ));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const moveItem = useCallback((id: string, category: ParaCategory) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, category, updatedAt: new Date().toISOString() } : item
    ));
  }, []);

  const changeStatus = useCallback((id: string, status: TaskStatus) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
    ));
  }, []);

  const getByCategory = useCallback((category: ParaCategory) => {
    return items.filter(i => i.category === category);
  }, [items]);

  const getByStatus = useCallback((status: TaskStatus) => {
    return items.filter(i => i.status === status);
  }, [items]);

  return { items, addItem, updateItem, deleteItem, moveItem, changeStatus, getByCategory, getByStatus };
}
