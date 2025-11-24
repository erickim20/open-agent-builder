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
  return (
    <div className={cn('rounded-xl bg-card p-2', selected && 'ring')}>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
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
