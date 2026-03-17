import { AppHeader } from '@/components/AppHeader';
import { LeftSidebar } from '@/components/LeftSidebar';
import { EditorArea } from '@/components/EditorArea';
import { RightPanel } from '@/components/RightPanel';
import { SettingsModal } from '@/components/SettingsModal';
import { BookmarkModal } from '@/components/BookmarkModal';
import { GraphView } from '@/components/GraphView';
import { CommandPalette } from '@/components/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function AppLayout() {
  useKeyboardShortcuts();
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader />
      <div className="flex-1 flex min-h-0">
        <LeftSidebar />
        <EditorArea />
        <RightPanel />
      </div>
      <SettingsModal />
      <BookmarkModal />
      <GraphView />
      <CommandPalette />
    </div>
  );
}

const Index = () => <AppLayout />;

export default Index;
