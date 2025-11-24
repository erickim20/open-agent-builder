import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { StartNode, Node } from '@/types/flow';
import { Trash2, Play } from 'lucide-react';

interface StartNodePanelProps {
  node: StartNode;
  onNodeUpdate: (node: Node) => void;
  onNodeDelete?: (nodeId: string) => void;
}

export function StartNodePanel({ node, onNodeUpdate, onNodeDelete }: StartNodePanelProps) {
  const handleUpdate = (updates: Partial<StartNode>) => {
    const updated = { ...node, ...updates } as StartNode;
    onNodeUpdate(updated);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-success/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <Play className="text-success h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-semibold">Start Node</h3>
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
        <Label htmlFor="start-label">Label</Label>
        <Input
          id="start-label"
          value={node.label}
          onChange={(e) => handleUpdate({ label: e.target.value })}
          className="mt-1 bg-muted"
        />
      </div>
      <div>
        <Label htmlFor="start-prompt">Input Description</Label>
        <Textarea
          id="start-prompt"
          value={node.inputSchema?.prompt || ''}
          onChange={(e) =>
            handleUpdate({
              inputSchema: {
                prompt: e.target.value
              }
            })
          }
          className="mt-1 bg-muted"
          placeholder="Describe what input this flow expects..."
        />
      </div>
    </div>
  );
}

