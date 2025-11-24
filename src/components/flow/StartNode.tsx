import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';
import type { StartNode as StartNodeType } from '@/types/flow';
import { cn } from '@/lib/utils';

interface StartNodeProps {
  data: StartNodeType | Record<string, unknown>;
  selected?: boolean;
}

export function StartNode({ data, selected }: StartNodeProps) {
  const nodeData = data as StartNodeType;
  return (
    <div className={cn('rounded-xl bg-card p-2', selected && 'ring')}>
      <div className="flex items-center gap-2">
        <div className="bg-success/10 flex h-8 w-8 items-center justify-center rounded-lg">
          <Play className="text-success h-4 w-4" />
        </div>
        <div className="pr-2 text-sm font-semibold">{nodeData.label}</div>
      </div>
      {nodeData.inputSchema?.prompt && (
        <div className="mt-2 text-sm text-muted-foreground">{nodeData.inputSchema.prompt}</div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-background !bg-primary"
      />
    </div>
  );
}
