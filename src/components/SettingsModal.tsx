import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function SettingsModal() {
  const { config, showSettings, setShowSettings, setConfig, openRouterKey, setOpenRouterKey } = useApp();
  const [pat, setPat] = useState(config?.pat || '');
  const [username, setUsername] = useState(config?.username || '');
  const [repo, setRepo] = useState(config?.repo || '');
  const [aiKey, setAiKey] = useState(openRouterKey);

  const handleSave = () => {
    if (pat && username && repo) {
      setConfig({ pat, username, repo });
    }
    setOpenRouterKey(aiKey);
    setShowSettings(false);
  };

  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="bg-card shadow-elevated border-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">GitHub Personal Access Token</Label>
            <Input value={pat} onChange={e => setPat(e.target.value)} type="password" placeholder="ghp_..." className="bg-secondary border-0 font-mono-editor text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">GitHub Username</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" className="bg-secondary border-0 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Repository Name</Label>
            <Input value={repo} onChange={e => setRepo(e.target.value)} placeholder="my-zettelkasten" className="bg-secondary border-0 text-sm" />
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">OpenRouter API Key</Label>
            <Input value={aiKey} onChange={e => setAiKey(e.target.value)} type="password" placeholder="sk-or-..." className="bg-secondary border-0 font-mono-editor text-sm" />
            <p className="text-xs text-muted-foreground">Free model: stepfun/step-3.5-flash:free</p>
          </div>
          <Button onClick={handleSave} className="w-full">Save Configuration</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
