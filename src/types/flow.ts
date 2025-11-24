// Core data models for the flow builder

export type NodeType = "start" | "agent" | "end";

export interface BaseNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
}

export interface StartNode extends BaseNode {
  type: "start";
  inputSchema?: {
    prompt?: string;
  };
}

export interface AgentNode extends BaseNode {
  type: "agent";
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface EndNode extends BaseNode {
  type: "end";
}

export type Node = StartNode | AgentNode | EndNode;

export interface Edge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

export interface Flow {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

// Execution result types
export interface AgentRunResult {
  output: string;
  raw?: {
    providerResponse?: unknown;
    error?: string;
  };
}

export interface FlowRunResult {
  runId: string;
  agents: Record<string, AgentRunResult>;
}



