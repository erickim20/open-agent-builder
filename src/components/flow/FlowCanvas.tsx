import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node as ReactFlowNode,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';
import { nodeTypes } from './nodeTypes';
import type { Flow, Node } from '@/types/flow';

interface FlowCanvasProps {
  flow: Flow;
  onFlowChange: (flow: Flow) => void;
  onNodeSelect?: (nodeId: string | null) => void;
  selectedNodeId?: string | null;
  onNodeUpdate?: (node: Node) => void;
  previewMode?: boolean;
}

export function FlowCanvas({
  flow,
  onFlowChange,
  onNodeSelect,
  selectedNodeId,
  onNodeUpdate,
  previewMode = false
}: FlowCanvasProps) {
  // Convert Flow nodes/edges to ReactFlow format
  const initialNodes: ReactFlowNode[] = useMemo(
    () =>
      flow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node,
          onNodeUpdate,
          onNodeSelect,
          previewMode
        } as unknown as Record<string, unknown>,
        selected: node.id === selectedNodeId,
        style: previewMode
          ? {
              opacity: 0.5,
              filter: 'grayscale(100%)'
            }
          : undefined
      })),
    [flow.nodes, selectedNodeId, onNodeUpdate, onNodeSelect, previewMode]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      flow.edges.map((edge) => ({
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId
      })),
    [flow.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when flow changes
  useEffect(() => {
    setNodes(
      flow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node,
          onNodeUpdate,
          onNodeSelect,
          previewMode
        } as unknown as Record<string, unknown>,
        selected: node.id === selectedNodeId,
        style: previewMode
          ? {
              opacity: 0.5,
              filter: 'grayscale(100%)'
            }
          : undefined
      }))
    );
    setEdges(
      flow.edges.map((edge) => ({
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        style: previewMode
          ? {
              opacity: 0.3
            }
          : undefined
      }))
    );
  }, [flow, selectedNodeId, setNodes, setEdges, onNodeUpdate, onNodeSelect, previewMode]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      // Validate connection
      const sourceNode = flow.nodes.find((n) => n.id === params.source);
      const targetNode = flow.nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      // Prevent connections to/from notes nodes
      if (sourceNode.type === 'notes' || targetNode.type === 'notes') {
        toast.error('Notes nodes cannot be connected to other nodes');
        return;
      }

      // Only allow: start -> agent, agent -> end
      const isValidConnection =
        (sourceNode.type === 'start' && targetNode.type === 'agent') ||
        (sourceNode.type === 'agent' && targetNode.type === 'end');

      if (!isValidConnection) {
        toast.error(
          `Invalid connection: ${sourceNode.type} → ${targetNode.type}. Only Start → Agent and Agent → End connections are allowed.`
        );
        return;
      }

      const newEdge = {
        id: `edge-${params.source}-${params.target}`,
        sourceNodeId: params.source,
        targetNodeId: params.target
      };

      const updatedFlow: Flow = {
        ...flow,
        edges: [...flow.edges, newEdge]
      };

      onFlowChange(updatedFlow);
    },
    [flow, onFlowChange]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      // In preview mode, allow clicking nodes to switch back to edit mode
      onNodeSelect?.(node.id);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  const onNodesDelete = useCallback(
    (deleted: ReactFlowNode[]) => {
      const deletedIds = new Set(deleted.map((n) => n.id));

      // Prevent deleting the last Start node
      const remainingStartNodes = flow.nodes.filter(
        (n) => n.type === 'start' && !deletedIds.has(n.id)
      );

      if (remainingStartNodes.length === 0) {
        toast.error('Cannot delete the last Start node. A flow must have at least one Start node.');
        return;
      }

      const updatedFlow: Flow = {
        ...flow,
        nodes: flow.nodes.filter((n) => !deletedIds.has(n.id)),
        edges: flow.edges.filter(
          (e) => !deletedIds.has(e.sourceNodeId) && !deletedIds.has(e.targetNodeId)
        )
      };
      onFlowChange(updatedFlow);
    },
    [flow, onFlowChange]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      const deletedIds = new Set(deleted.map((e) => e.id));
      const updatedFlow: Flow = {
        ...flow,
        edges: flow.edges.filter((e) => !deletedIds.has(e.id))
      };
      onFlowChange(updatedFlow);
    },
    [flow, onFlowChange]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      const updatedNodes = flow.nodes.map((n) =>
        n.id === node.id ? { ...n, position: node.position } : n
      );
      const updatedFlow: Flow = {
        ...flow,
        nodes: updatedNodes
      };
      onFlowChange(updatedFlow);
    },
    [flow, onFlowChange]
  );

  return (
    <div className="h-full w-full bg-muted">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={previewMode ? undefined : onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={previewMode ? undefined : onNodesDelete}
        onEdgesDelete={previewMode ? undefined : onEdgesDelete}
        onNodeDragStop={previewMode ? undefined : onNodeDragStop}
        nodesDraggable={!previewMode}
        nodesConnectable={!previewMode}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        {/* <Background /> */}
        {/* <Controls />
        <MiniMap /> */}
      </ReactFlow>
    </div>
  );
}
