import { Handle, Position } from "@xyflow/react";
import { Square } from "lucide-react";
import type { EndNode as EndNodeType } from "@/types/flow";

interface EndNodeProps {
  data: EndNodeType | Record<string, unknown>;
  selected?: boolean;
}

export function EndNode({ data, selected }: EndNodeProps) {
  const nodeData = data as EndNodeType;
  return (
    <div
      className={`rounded-lg border-2 bg-card p-4 shadow-md min-w-[180px] ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <Square className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="font-semibold text-sm">{nodeData.label}</div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !border-2 !border-background !w-3 !h-3"
      />
    </div>
  );
}

