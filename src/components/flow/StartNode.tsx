import { Handle, Position } from "@xyflow/react";
import { Play } from "lucide-react";
import type { StartNode as StartNodeType } from "@/types/flow";

interface StartNodeProps {
  data: StartNodeType | Record<string, unknown>;
  selected?: boolean;
}

export function StartNode({ data, selected }: StartNodeProps) {
  const nodeData = data as StartNodeType;
  return (
    <div
      className={`rounded-lg border-2 bg-card p-4 shadow-md min-w-[180px] ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Play className="h-4 w-4 text-primary" />
        </div>
        <div className="font-semibold text-sm">{nodeData.label}</div>
      </div>
      {nodeData.inputSchema?.prompt && (
        <div className="text-xs text-muted-foreground mt-2">
          {nodeData.inputSchema.prompt}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !border-2 !border-background !w-3 !h-3"
      />
    </div>
  );
}

