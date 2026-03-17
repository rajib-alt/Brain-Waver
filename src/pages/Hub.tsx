import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, DollarSign, FileText, ArrowLeft, Layers, LogIn, LogOut, User } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FinanceDashboard } from '@/components/finance/FinanceDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsSync } from '@/hooks/useSettingsSync';


export default function Hub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('finances');
  const { user, signOut } = useAuth();
  useSettingsSync(user);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-panel/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/notes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-heading font-semibold text-foreground">Command Center</h1>
          </div>
          <div className="ml-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-9">
                <TabsTrigger value="notes" className="text-xs h-7 gap-1.5 px-3">
                  <FileText className="h-3.5 w-3.5" /> Notes
                </TabsTrigger>
                <TabsTrigger value="second-brain" className="text-xs h-7 gap-1.5 px-3">
                  <Brain className="h-3.5 w-3.5" /> Second Brain
                </TabsTrigger>
                <TabsTrigger value="finances" className="text-xs h-7 gap-1.5 px-3">
                  <DollarSign className="h-3.5 w-3.5" /> Finances
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</span>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={signOut}>
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => navigate('/auth')}>
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'notes' && (
          <div className="text-center py-16 space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-heading font-semibold text-foreground">Notes Overview</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your notes workspace lives in the main editor. Head there to create, edit, and organize your notes.
            </p>
            <Button variant="outline" onClick={() => navigate('/notes')} className="gap-2">
              <FileText className="h-4 w-4" /> Go to Notes
            </Button>
          </div>
        )}

        {activeTab === 'second-brain' && <DashboardInner />}

        {activeTab === 'finances' && <FinanceDashboard />}
      </main>
    </div>
  );
}


// Import the dashboard internals
import { useApp } from '@/store/AppContext';
import { useParaStore, type ParaCategory, type ParaItem } from '@/store/useParaStore';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { TaskModal } from '@/components/dashboard/TaskModal';
import {
  FolderKanban, BookOpen, Archive, Download, Sparkles, Share2,
  Search, Shield, Zap, LayoutGrid, ListChecks, Hash, Link2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';

function StatCard({ icon: Icon, label, value, accent = false }: { icon: any; label: string; value: string | number; accent?: boolean }) {
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${accent ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-heading font-bold mt-1 text-foreground">{value}</p>
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MethodCard({ icon: Icon, title, description, items, color }: { icon: any; title: string; description: string; items: string[]; color: string }) {
  return (
    <Card className="group hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg font-heading">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}><Icon className="h-4.5 w-4.5" /></div>
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DashboardInner() {
  const { files, tags, backlinks } = useApp();
  const store = useParaStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ParaItem | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<ParaCategory>('projects');
  const [viewMode, setViewMode] = useState<'category' | 'status'>('category');
  const [activeTab, setActiveTab] = useState<'kanban' | 'guide'>('kanban');

  const stats = useMemo(() => {
    let noteCount = 0, folderCount = 0, totalWords = 0;
    const walk = (nodes: typeof files) => {
      for (const n of nodes) {
        if (n.isFolder) { folderCount++; if (n.children) walk(n.children); }
        else { noteCount++; if (n.content) totalWords += n.content.split(/\s+/).filter(Boolean).length; }
      }
    };
    walk(files);
    const backlinkCount = Object.values(backlinks).reduce((sum, arr) => sum + arr.length, 0);
    return { noteCount, folderCount, tagCount: tags.length, totalWords, backlinkCount };
  }, [files, tags, backlinks]);

  const taskStats = useMemo(() => ({
    total: store.items.length,
    done: store.items.filter(i => i.status === 'done').length,
    overdue: store.items.filter(i => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'done').length,
  }), [store.items]);

  const handleAdd = (category: ParaCategory) => { setEditingItem(null); setDefaultCategory(category); setShowTaskModal(true); };
  const handleEdit = (item: ParaItem) => { setEditingItem(item); setDefaultCategory(item.category); setShowTaskModal(true); };
  const handleSave = (data: any) => { editingItem ? store.updateItem(editingItem.id, data) : store.addItem(data); };

  const codeSteps = [
    { icon: Download, title: 'Capture', color: 'bg-primary/20 text-primary', description: 'Save what resonates.', items: ['Highlight key passages', 'Save interesting articles', 'Jot down fleeting ideas'] },
    { icon: Layers, title: 'Organize', color: 'bg-accent/20 text-accent-foreground', description: 'Place info into PARA categories.', items: ['Sort by actionability', 'Move items between categories', 'Keep inbox zero'] },
    { icon: Sparkles, title: 'Distill', color: 'bg-secondary text-secondary-foreground', description: 'Summarize to find the core idea.', items: ['Progressive summarization', 'Bold key passages', 'Extract essential takeaways'] },
    { icon: Share2, title: 'Express', color: 'bg-muted text-muted-foreground', description: 'Create new work from knowledge.', items: ['Write articles from ideas', 'Build presentations', 'Share with your network'] },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={FileText} label="Notes" value={stats.noteCount} accent />
        <StatCard icon={FolderKanban} label="Tasks" value={taskStats.total} />
        <StatCard icon={ListChecks} label="Done" value={taskStats.done} />
        <StatCard icon={Hash} label="Tags" value={stats.tagCount} />
        <StatCard icon={Link2} label="Backlinks" value={stats.backlinkCount} />
        <StatCard icon={BookOpen} label="Words" value={stats.totalWords.toLocaleString()} />
      </div>
      {taskStats.overdue > 0 && (
        <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
          ⚠️ You have <strong>{taskStats.overdue}</strong> overdue {taskStats.overdue === 1 ? 'item' : 'items'}
        </div>
      )}

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="kanban" className="text-xs h-7 gap-1.5 px-3"><LayoutGrid className="h-3.5 w-3.5" /> Board</TabsTrigger>
            <TabsTrigger value="guide" className="text-xs h-7 gap-1.5 px-3"><BookOpen className="h-3.5 w-3.5" /> Guide</TabsTrigger>
          </TabsList>
        </Tabs>
        {activeTab === 'kanban' && (
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="category" className="text-xs h-7 px-3">By Category</TabsTrigger>
                <TabsTrigger value="status" className="text-xs h-7 px-3">By Status</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => handleAdd('projects')}>
              <Zap className="h-3.5 w-3.5" /> Add Item
            </Button>
          </div>
        )}
      </div>

      {activeTab === 'kanban' && (
        <KanbanBoard items={store.items} onEdit={handleEdit} onDelete={store.deleteItem} onStatusChange={store.changeStatus} onCategoryChange={store.moveItem} onAdd={handleAdd} viewMode={viewMode} />
      )}

      {activeTab === 'guide' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">The CODE Framework</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {codeSteps.map(s => <MethodCard key={s.title} {...s} />)}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Why Build a Second Brain?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Search, title: 'Information Management', desc: 'A trusted, searchable archive for articles, books, courses, and daily notes.' },
                { icon: Shield, title: 'Reduced Cognitive Load', desc: 'Stop trying to remember everything. Free your mind for creative work.' },
                { icon: Zap, title: 'Improved Productivity', desc: 'Quick retrieval accelerates project completion and better decisions.' },
              ].map(b => (
                <Card key={b.title} className="group hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4"><b.icon className="h-5 w-5" /></div>
                    <h3 className="font-heading font-semibold text-foreground mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      <TaskModal open={showTaskModal} onOpenChange={setShowTaskModal} onSave={handleSave} editItem={editingItem} defaultCategory={defaultCategory} />
    </div>
  );
}
