import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { saveApiKeyToStorage, getApiKeyFromStorage } from '@/lib/flowStorage';
import { toast } from 'sonner';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyDialog({ open, onOpenChange }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState(() => getApiKeyFromStorage() || '');

  // Reset API key when dialog opens
  useEffect(() => {
    if (open) {
      setApiKey(getApiKeyFromStorage() || '');
    }
  }, [open]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    saveApiKeyToStorage(apiKey.trim());
    toast.success('API key saved successfully');
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setApiKey(getApiKeyFromStorage() || '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OpenAI API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to enable real API calls. Your key is stored locally and
            never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 bg-muted"
              placeholder="sk-..."
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Your API key is stored securely in your browser&apos;s local storage.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={handleCancel}>
            Cancel
          </Button>
          <Button className="rounded-full" onClick={handleSaveApiKey}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



