import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { NotesNode, Node } from '@/types/flow';
import { Trash2, StickyNote } from 'lucide-react';

interface NotesNodePanelProps {
  node: NotesNode;
  onNodeUpdate: (node: Node) => void;
  onNodeDelete?: (nodeId: string) => void;
}

export function NotesNodePanel({ node, onNodeUpdate, onNodeDelete }: NotesNodePanelProps) {
  const handleUpdate = (updates: Partial<NotesNode>) => {
    const updated = { ...node, ...updates } as NotesNode;
    onNodeUpdate(updated);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
            <StickyNote className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h3 className="text-sm font-semibold">Notes Node</h3>
        </div>
        {onNodeDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNodeDelete(node.id)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor="notes-label">Label</Label>
        <Input
          id="notes-label"
          value={node.label}
          onChange={(e) => handleUpdate({ label: e.target.value })}
          className="mt-1 bg-muted"
        />
      </div>
      <div>
        <Label htmlFor="notes-content">Content</Label>
        <Textarea
          id="notes-content"
          value={node.content}
          onChange={(e) => handleUpdate({ content: e.target.value })}
          className="mt-1 bg-muted"
          rows={8}
          placeholder="Enter your note here..."
        />
      </div>
    </div>
  );
}

