import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';
import type { EndNode as EndNodeType } from '@/types/flow';
import { cn } from '@/lib/utils';

interface EndNodeProps {
  data: EndNodeType | Record<string, unknown>;
  selected?: boolean;
}

export function EndNode({ data, selected }: EndNodeProps) {
  const nodeData = data as EndNodeType;
  return (
    <div className={cn('rounded-xl bg-card p-2', selected && 'ring')}>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
          <Square className="h-4 w-4 text-destructive" />
        </div>
        <div className="pr-2 text-sm font-semibold">{nodeData.label}</div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-background !bg-primary"
      />
    </div>
  );
}
