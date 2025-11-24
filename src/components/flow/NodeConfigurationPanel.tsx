import { useState, useEffect } from 'react';
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
import type { Node, StartNode, AgentNode, EndNode } from '@/types/flow';
import { Trash2 } from 'lucide-react';

interface NodeConfigurationPanelProps {
  node: Node | null;
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

export function NodeConfigurationPanel({
  node,
  onNodeUpdate,
  onNodeDelete
}: NodeConfigurationPanelProps) {
  const [localNode, setLocalNode] = useState<Node | null>(node);

  useEffect(() => {
    setLocalNode(node);
  }, [node]);

  if (!localNode) {
    return <div className="p-4 text-sm text-muted-foreground">Select a node to configure it</div>;
  }

  const handleUpdate = (updates: Partial<Node>) => {
    if (!localNode) return;
    const updated = { ...localNode, ...updates } as Node;
    setLocalNode(updated);
    onNodeUpdate(updated);
  };

  if (localNode.type === 'start') {
    const startNode = localNode as StartNode;
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Start Node</h3>
          {onNodeDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNodeDelete(localNode.id)}
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
            value={startNode.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            className="mt-1 bg-muted"
          />
        </div>
        <div>
          <Label htmlFor="start-prompt">Input Description</Label>
          <Textarea
            id="start-prompt"
            value={startNode.inputSchema?.prompt || ''}
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

  if (localNode.type === 'agent') {
    const agentNode = localNode as AgentNode;
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Agent Node</h3>
          {onNodeDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNodeDelete(localNode.id)}
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
            value={agentNode.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            className="mt-1 bg-muted"
          />
        </div>
        <div>
          <Label htmlFor="agent-model">Model</Label>
          <Select value={agentNode.model} onValueChange={(value) => handleUpdate({ model: value })}>
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
            value={agentNode.systemPrompt}
            onChange={(e) => handleUpdate({ systemPrompt: e.target.value })}
            className="mt-1 bg-muted"
            rows={6}
            placeholder="Enter the system prompt for this agent..."
          />
        </div>
        <div>
          <Label htmlFor="agent-temperature">Temperature: {agentNode.temperature.toFixed(2)}</Label>
          <Slider
            id="agent-temperature"
            value={[agentNode.temperature]}
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
            value={agentNode.maxTokens}
            onChange={(e) => handleUpdate({ maxTokens: parseInt(e.target.value) || 0 })}
            className="mt-1 bg-muted"
            min={1}
            max={32000}
          />
        </div>
      </div>
    );
  }

  if (localNode.type === 'end') {
    const endNode = localNode as EndNode;
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">End Node</h3>
          {onNodeDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNodeDelete(localNode.id)}
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
            value={endNode.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            className="mt-1 bg-muted"
          />
        </div>
      </div>
    );
  }

  return null;
}
