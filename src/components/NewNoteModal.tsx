import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NOTE_TEMPLATES, VAULT_FOLDERS, RATING_LABELS, generateNoteContent, NoteTemplate } from '@/lib/templates';
import { Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewNoteModal({ open, onOpenChange }: NewNoteModalProps) {
  const { createNote, saveFile, fetchFiles, loadFile } = useApp();
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate>(NOTE_TEMPLATES[0]);
  const [noteName, setNoteName] = useState('');
  const [folder, setFolder] = useState('__root__');
  const [propertyValues, setPropertyValues] = useState<Record<string, string>>({});

  const reset = () => {
    setStep('template');
    setSelectedTemplate(NOTE_TEMPLATES[0]);
    setNoteName('');
    setFolder('__root__');
    setPropertyValues({});
  };

  const handleSelectTemplate = (template: NoteTemplate) => {
    setSelectedTemplate(template);
    setFolder(template.defaultFolder || '__root__');
    // Pre-fill defaults
    const defaults: Record<string, string> = {};
    template.properties.forEach(p => {
      if (p.default && p.default !== 'today') defaults[p.key] = p.default;
    });
    setPropertyValues(defaults);
    setStep('details');
  };

  const handleCreate = async () => {
    if (!noteName.trim()) return;
    const actualFolder = folder === '__root__' ? '' : folder;
    const content = generateNoteContent(selectedTemplate, noteName.trim(), propertyValues);
    const path = actualFolder ? `${actualFolder}/${noteName.trim()}.md` : `${noteName.trim()}.md`;
    
    await saveFile(path, content);
    await fetchFiles();
    await loadFile(path);
    
    onOpenChange(false);
    reset();
  };

  const updateProperty = (key: string, value: string) => {
    setPropertyValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="bg-card shadow-elevated border-border/30 sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">
            {step === 'template' ? 'Choose a Template' : (
              <button onClick={() => setStep('template')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                Templates <ChevronRight className="h-3 w-3" /> <span className="text-foreground">{selectedTemplate.icon} {selectedTemplate.name}</span>
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'template' ? (
          <div className="grid grid-cols-2 gap-2 overflow-y-auto scrollbar-thin pr-1 max-h-[60vh]">
            {NOTE_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className="flex flex-col items-start gap-1 p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/20 transition-all text-left group"
              >
                <span className="text-lg">{t.icon}</span>
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{t.name}</span>
                <span className="text-[10px] text-muted-foreground leading-snug">{t.description}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto scrollbar-thin pr-1 max-h-[60vh]">
            {/* Name */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Note Title</label>
              <Input
                value={noteName}
                onChange={e => setNoteName(e.target.value)}
                placeholder="My note title"
                className="bg-secondary border-border/30 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>

            {/* Folder */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Folder</label>
              <Select value={folder} onValueChange={setFolder}>
                <SelectTrigger className="bg-secondary border-border/30 text-sm">
                  <SelectValue placeholder="Root (Personal)" />
                </SelectTrigger>
                <SelectContent>
                  {VAULT_FOLDERS.map(f => (
                    <SelectItem key={f.path} value={f.path || '__root__'}>
                      <div className="flex flex-col">
                        <span className="text-xs">{f.label}</span>
                        <span className="text-[10px] text-muted-foreground">{f.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Properties */}
            {selectedTemplate.properties.filter(p => p.key !== 'created').length > 0 && (
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">Properties</label>
                <div className="space-y-2">
                  {selectedTemplate.properties
                    .filter(p => p.key !== 'created')
                    .map(prop => (
                      <div key={prop.key} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-20 flex-shrink-0 font-mono-editor">{prop.key}</span>
                        {prop.type === 'rating' ? (
                          <RatingInput
                            value={parseInt(propertyValues[prop.key] || '0')}
                            onChange={v => updateProperty(prop.key, v.toString())}
                          />
                        ) : (
                          <Input
                            value={propertyValues[prop.key] || ''}
                            onChange={e => updateProperty(prop.key, e.target.value)}
                            placeholder={prop.type === 'list' ? 'comma, separated, values' : prop.type === 'date' ? 'YYYY-MM-DD' : ''}
                            className="bg-secondary border-border/30 text-xs h-7 flex-1"
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Button onClick={handleCreate} disabled={!noteName.trim()} className="w-full">
              Create Note
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7].map(n => (
          <button
            key={n}
            onClick={() => onChange(value === n ? 0 : n)}
            className={cn(
              "h-6 w-6 rounded text-[10px] font-medium transition-all",
              n === value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{RATING_LABELS[value]}</p>
      )}
    </div>
  );
}
