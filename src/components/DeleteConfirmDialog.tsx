import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

const WORDS = ['confirm', 'remove', 'erase', 'purge', 'discard', 'obliterate', 'vanish', 'expunge', 'abolish', 'annul', 'revoke', 'destroy', 'eliminate', 'wipe', 'scrap'];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  itemName: string;
  itemType: 'file' | 'folder';
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmDialog({ open, onOpenChange, itemName, itemType, onConfirm }: DeleteConfirmDialogProps) {
  const [step, setStep] = useState(1);
  const [typedWord, setTypedWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const challengeWord = useMemo(() => getRandomWord(), [open]);

  const reset = useCallback(() => {
    setStep(1);
    setTypedWord('');
    setIsDeleting(false);
  }, []);

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFinalDelete = async () => {
    if (typedWord.toLowerCase() !== challengeWord.toLowerCase()) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      handleOpenChange(false);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-panel border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive font-heading">
            <AlertTriangle className="h-5 w-5" />
            Delete {itemType}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 1 ? (
              <>You are about to delete the {itemType} <strong className="text-foreground">"{itemName}"</strong>. {itemType === 'folder' ? 'This will delete all files inside it.' : ''} This action cannot be undone.</>
            ) : (
              <>To confirm deletion, type the word <strong className="text-primary font-mono text-base">{challengeWord}</strong> below.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === 2 && (
          <div className="py-2">
            <Input
              value={typedWord}
              onChange={e => setTypedWord(e.target.value)}
              placeholder={`Type "${challengeWord}" to confirm`}
              className="bg-secondary border-border font-mono"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleFinalDelete(); }}
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button variant="destructive" onClick={() => setStep(2)}>
              Yes, I want to delete
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleFinalDelete}
              disabled={typedWord.toLowerCase() !== challengeWord.toLowerCase() || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete permanently'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
