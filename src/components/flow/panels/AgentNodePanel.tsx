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
import type { AgentNode, Node } from '@/types/flow';
import { Trash2, Bot } from 'lucide-react';

const EFFORT_LEVELS = [
  { value: 1, label: 'Minimal' },
  { value: 3, label: 'Low' },
  { value: 5, label: 'Medium' },
  { value: 7, label: 'High' },
  { value: 10, label: 'Maximum' }
] as const;

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
  // Local state for text inputs to prevent cursor jumping
  const [label, setLabel] = useState(node.label);
  const [systemPrompt, setSystemPrompt] = useState(node.systemPrompt);

  // Sync local state when node prop changes (e.g., when switching nodes)
  useEffect(() => {
    setLabel(node.label);
    setSystemPrompt(node.systemPrompt);
  }, [node.id, node.label, node.systemPrompt]);

  const handleUpdate = (updates: Partial<AgentNode>) => {
    const updated = { ...node, ...updates } as AgentNode;
    onNodeUpdate(updated);
  };

  const handleLabelBlur = () => {
    if (label !== node.label) {
      handleUpdate({ label });
    }
  };

  const handleSystemPromptBlur = () => {
    if (systemPrompt !== node.systemPrompt) {
      handleUpdate({ systemPrompt });
    }
  };

  const isGPT5 = node.model.startsWith('gpt-5');
  const effort = node.effort ?? 5;
  // Find closest effort level or default to Medium
  const effortLevel =
    EFFORT_LEVELS.find((level) => level.value === effort) ||
    EFFORT_LEVELS.reduce((prev, curr) =>
      Math.abs(curr.value - effort) < Math.abs(prev.value - effort) ? curr : prev
    ) ||
    EFFORT_LEVELS[2];

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
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleLabelBlur}
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
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          onBlur={handleSystemPromptBlur}
          className="mt-1 bg-muted"
          rows={6}
          placeholder="Enter the system prompt for this agent..."
        />
      </div>
      {isGPT5 ? (
        <div>
          <Label htmlFor="agent-effort">Effort</Label>
          <Select
            value={effortLevel.value.toString()}
            onValueChange={(value) => handleUpdate({ effort: parseFloat(value) })}
          >
            <SelectTrigger id="agent-effort" className="mt-1 bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EFFORT_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value.toString()}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
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
      )}
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
