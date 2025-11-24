import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { importFlowFromJSON } from '@/lib/flowStorage';
import type { Flow } from '@/types/flow';
import { toast } from 'sonner';

interface ImportFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (flow: Flow) => void;
}

export function ImportFlowDialog({ open, onOpenChange, onImport }: ImportFlowDialogProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedFlow = await importFlowFromJSON(file);
        onImport(importedFlow);
        toast.success('Flow imported successfully');
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to import flow');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Flow</DialogTitle>
          <DialogDescription>Select a JSON file to import a flow.</DialogDescription>
        </DialogHeader>
        <div>
          <Input
            type="file"
            accept=".json"
            className="bg-muted"
            onChange={handleFileChange}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


