import { Handle, Position } from "@xyflow/react";
import { Bot } from "lucide-react";
import type { AgentNode as AgentNodeType } from "@/types/flow";

interface AgentNodeProps {
  data: AgentNodeType | Record<string, unknown>;
  selected?: boolean;
}

export function AgentNode({ data, selected }: AgentNodeProps) {
  const nodeData = data as AgentNodeType;
  return (
    <div
      className={`rounded-lg border-2 bg-card p-4 shadow-md min-w-[200px] ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{nodeData.label}</div>
          <div className="text-xs text-muted-foreground">{nodeData.model}</div>
        </div>
      </div>
      {nodeData.systemPrompt && (
        <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {nodeData.systemPrompt}
        </div>
      )}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !border-2 !border-background !w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !border-2 !border-background !w-3 !h-3"
      />
    </div>
  );
}

