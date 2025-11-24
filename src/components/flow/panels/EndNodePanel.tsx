import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { EndNode, Node } from '@/types/flow';
import { Trash2, Square } from 'lucide-react';

interface EndNodePanelProps {
  node: EndNode;
  onNodeUpdate: (node: Node) => void;
  onNodeDelete?: (nodeId: string) => void;
}

export function EndNodePanel({ node, onNodeUpdate, onNodeDelete }: EndNodePanelProps) {
  const handleUpdate = (updates: Partial<EndNode>) => {
    const updated = { ...node, ...updates } as EndNode;
    onNodeUpdate(updated);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <Square className="h-3.5 w-3.5 text-destructive" />
          </div>
          <h3 className="text-sm font-semibold">End Node</h3>
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
        <Label htmlFor="end-label">Label</Label>
        <Input
          id="end-label"
          value={node.label}
          onChange={(e) => handleUpdate({ label: e.target.value })}
          className="mt-1 bg-muted"
        />
      </div>
    </div>
  );
}

