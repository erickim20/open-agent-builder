import { useState, useEffect } from 'react';
import type { Node } from '@/types/flow';
import { StartNodePanel } from './panels/StartNodePanel';
import { AgentNodePanel } from './panels/AgentNodePanel';
import { EndNodePanel } from './panels/EndNodePanel';
import { NotesNodePanel } from './panels/NotesNodePanel';

interface NodeConfigurationPanelProps {
  node: Node | null;
  onNodeUpdate: (node: Node) => void;
  onNodeDelete?: (nodeId: string) => void;
}

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

  switch (localNode.type) {
    case 'start':
      return (
        <StartNodePanel
          node={localNode}
          onNodeUpdate={onNodeUpdate}
          onNodeDelete={onNodeDelete}
        />
      );
    case 'agent':
      return (
        <AgentNodePanel
          node={localNode}
          onNodeUpdate={onNodeUpdate}
          onNodeDelete={onNodeDelete}
        />
      );
    case 'end':
      return (
        <EndNodePanel
          node={localNode}
          onNodeUpdate={onNodeUpdate}
          onNodeDelete={onNodeDelete}
        />
      );
    case 'notes':
      return (
        <NotesNodePanel
          node={localNode}
          onNodeUpdate={onNodeUpdate}
          onNodeDelete={onNodeDelete}
        />
      );
    default:
      return null;
  }
}
