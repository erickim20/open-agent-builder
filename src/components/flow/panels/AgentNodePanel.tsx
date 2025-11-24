import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { AgentNode, Node } from '@/types/flow';
import { Trash2, Bot } from 'lucide-react';

interface AgentNodePanelProps {
  node: AgentNode;
  onNodeUpdate: (node: Node) => void;
  onNodeDelete?: (nodeId: string) => void;
}

const AVAILABLE_MODELS = [
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
  'gpt-4o-mini'
];

export function AgentNodePanel({ node, onNodeUpdate, onNodeDelete }: AgentNodePanelProps) {
  const handleUpdate = (updates: Partial<AgentNode>) => {
    const updated = { ...node, ...updates } as AgentNode;
    onNodeUpdate(updated);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Bot className="h-3.5 w-3.5 text-accent" />
          </div>
          <h3 className="text-sm font-semibold">Agent Node</h3>
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
        <Label htmlFor="agent-label">Label</Label>
        <Input
          id="agent-label"
          value={node.label}
          onChange={(e) => handleUpdate({ label: e.target.value })}
          className="mt-1 bg-muted"
        />
      </div>
      <div>
        <Label htmlFor="agent-model">Model</Label>
        <Select value={node.model} onValueChange={(value) => handleUpdate({ model: value })}>
          <SelectTrigger id="agent-model" className="mt-1 bg-muted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_MODELS.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="agent-system-prompt">System Prompt</Label>
        <Textarea
          id="agent-system-prompt"
          value={node.systemPrompt}
          onChange={(e) => handleUpdate({ systemPrompt: e.target.value })}
          className="mt-1 bg-muted"
          rows={6}
          placeholder="Enter the system prompt for this agent..."
        />
      </div>
      <div>
        <Label htmlFor="agent-temperature">Temperature: {node.temperature.toFixed(2)}</Label>
        <Slider
          id="agent-temperature"
          value={[node.temperature]}
          onValueChange={([value]) => handleUpdate({ temperature: value })}
          min={0}
          max={2}
          step={0.1}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="agent-max-tokens">Max Tokens</Label>
        <Input
          id="agent-max-tokens"
          type="number"
          value={node.maxTokens}
          onChange={(e) => handleUpdate({ maxTokens: parseInt(e.target.value) || 0 })}
          className="mt-1 bg-muted"
          min={1}
          max={32000}
        />
      </div>
    </div>
  );
}

