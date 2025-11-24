import { Handle, Position } from '@xyflow/react';
import { Bot } from 'lucide-react';
import type { AgentNode as AgentNodeType } from '@/types/flow';
import { cn } from '@/lib/utils';

interface AgentNodeProps {
  data: AgentNodeType | Record<string, unknown>;
  selected?: boolean;
}

export function AgentNode({ data, selected }: AgentNodeProps) {
  const nodeData = data as AgentNodeType;
  const isStreaming = (data as Record<string, unknown>).isStreaming === true;
  return (
    <div
      className={cn(
        'relative rounded-xl bg-card p-2 transition-all',
        selected && 'ring',
        isStreaming && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {isStreaming && <div className="absolute inset-0 animate-pulse rounded-xl bg-primary/20" />}
      <div className="relative flex items-center gap-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
            isStreaming ? 'bg-primary/20' : 'bg-accent/10'
          )}
        >
          <Bot
            className={cn(
              'h-4 w-4 transition-colors',
              isStreaming ? 'animate-pulse text-primary' : 'text-accent'
            )}
          />
        </div>
        <div className="flex-1 pr-2">
          <div className="text-sm font-semibold">{nodeData.label}</div>
          {/* <div className="text-sm text-muted-foreground">
            {nodeData.type[0].toUpperCase() + nodeData.type.slice(1)}
          </div> */}
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-background !bg-primary"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-background !bg-primary"
      />
    </div>
  );
}
