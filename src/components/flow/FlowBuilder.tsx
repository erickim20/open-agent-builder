import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FlowCanvas } from './FlowCanvas';
import { NodeConfigurationPanel } from './NodeConfigurationPanel';
import { FlowSwitcher } from './FlowSwitcher';
import { RunFlowDialog } from './RunFlowDialog';
import { ImportFlowDialog } from './ImportFlowDialog';
import { ApiKeyDialog } from './ApiKeyDialog';
import {
  saveFlowToStorage,
  getCurrentFlowFromStorage,
  getFlowsFromStorage,
  deleteFlowFromStorage,
  exportFlowAsJSON
} from '@/lib/flowStorage';
import type { Flow, Node, AgentNode, EndNode } from '@/types/flow';
import { toast } from 'sonner';
import { Play, BotIcon, SquareIcon, MoreHorizontal, Key } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

function createDefaultFlow(): Flow {
  const startNode: Node = {
    id: 'start-1',
    type: 'start',
    label: 'Start',
    position: { x: 250, y: 50 },
    inputSchema: {
      prompt: ''
    }
  };

  return {
    id: crypto.randomUUID(),
    name: 'New Flow',
    nodes: [startNode],
    edges: []
  };
}

export function FlowBuilder() {
  const [flow, setFlow] = useState<Flow>(() => {
    const saved = getCurrentFlowFromStorage();
    return saved || createDefaultFlow();
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    saveFlowToStorage(flow);
  }, [flow]);

  const handleFlowChange = useCallback((updatedFlow: Flow) => {
    setFlow(updatedFlow);
  }, []);

  const handleNodeUpdate = useCallback(
    (updatedNode: Node) => {
      const updatedNodes = flow.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
      setFlow({ ...flow, nodes: updatedNodes });
    },
    [flow]
  );

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      const nodeToDelete = flow.nodes.find((n) => n.id === nodeId);
      if (!nodeToDelete) return;

      // Prevent deleting the last Start node
      if (nodeToDelete.type === 'start') {
        const remainingStartNodes = flow.nodes.filter((n) => n.type === 'start' && n.id !== nodeId);
        if (remainingStartNodes.length === 0) {
          toast.error(
            'Cannot delete the last Start node. A flow must have at least one Start node.'
          );
          return;
        }
      }

      const updatedFlow: Flow = {
        ...flow,
        nodes: flow.nodes.filter((n) => n.id !== nodeId),
        edges: flow.edges.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId)
      };

      setFlow(updatedFlow);
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
      toast.success('Node deleted');
    },
    [flow, selectedNodeId]
  );

  const handleAddAgent = useCallback(() => {
    const newAgent: AgentNode = {
      id: `agent-${crypto.randomUUID()}`,
      type: 'agent',
      label: 'New Agent',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 200
      },
      model: 'gpt-4.1-mini',
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 2000
    };

    setFlow({
      ...flow,
      nodes: [...flow.nodes, newAgent]
    });
  }, [flow]);

  const handleAddEnd = useCallback(() => {
    const newEnd: EndNode = {
      id: `end-${crypto.randomUUID()}`,
      type: 'end',
      label: 'End',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 400
      }
    };

    setFlow({
      ...flow,
      nodes: [...flow.nodes, newEnd]
    });
  }, [flow]);

  const handleExport = useCallback(() => {
    try {
      exportFlowAsJSON(flow);
      toast.success('Flow exported successfully');
    } catch {
      toast.error('Failed to export flow');
    }
  }, [flow]);

  const handleImport = useCallback((importedFlow: Flow) => {
    setFlow(importedFlow);
    setSelectedNodeId(null);
  }, []);

  const handleNewFlow = useCallback(() => {
    const newFlow = createDefaultFlow();
    setFlow(newFlow);
    setSelectedNodeId(null);
    toast.success('New flow created');
  }, []);

  const handleFlowSelect = useCallback((selectedFlow: Flow) => {
    setFlow(selectedFlow);
    setSelectedNodeId(null);
    toast.success(`Switched to "${selectedFlow.name}"`);
  }, []);

  const handleDeleteFlow = useCallback(() => {
    const allFlows = getFlowsFromStorage();
    if (allFlows.length <= 1) {
      toast.error('Cannot delete the last flow');
      return;
    }

    if (confirm(`Are you sure you want to delete "${flow.name}"?`)) {
      deleteFlowFromStorage(flow.id);

      // Switch to another flow
      const remainingFlows = allFlows.filter((f) => f.id !== flow.id);
      if (remainingFlows.length > 0) {
        setFlow(remainingFlows[0]);
        setSelectedNodeId(null);
        toast.success(`Deleted "${flow.name}" and switched to "${remainingFlows[0].name}"`);
      } else {
        const newFlow = createDefaultFlow();
        setFlow(newFlow);
        setSelectedNodeId(null);
        toast.success(`Deleted "${flow.name}"`);
      }
    }
  }, [flow]);

  const selectedNode = flow.nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <div className="bg-muted px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlowSwitcher
              currentFlow={flow}
              onFlowSelect={handleFlowSelect}
              onNewFlow={handleNewFlow}
              onFlowNameChange={(name) => setFlow({ ...flow, name })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setApiKeyDialogOpen(true)}
              title="OpenAI API Key Settings"
            >
              <Key className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="secondary" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>Export</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteFlow} className="text-destructive">
                  Delete Flow
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setRunDialogOpen(true)} size="sm">
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1">
          <FlowCanvas
            flow={flow}
            onFlowChange={handleFlowChange}
            onNodeSelect={setSelectedNodeId}
            selectedNodeId={selectedNodeId}
          />
        </div>

        <div className="absolute left-4 top-4 w-80 overflow-y-auto rounded-xl bg-card">
          <div className="p-2">
            <h2 className="p-2 text-sm font-medium text-muted-foreground">Core</h2>
            <div className="space-y-2">
              <div
                onClick={handleAddAgent}
                className="flex w-full items-center gap-2 rounded-xl p-2 transition-colors hover:bg-muted"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <BotIcon className="h-4 w-4 text-primary" />
                </div>
                Agent
              </div>
              <div
                onClick={handleAddEnd}
                className="flex w-full items-center gap-2 rounded-xl p-2 transition-colors hover:bg-muted"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <SquareIcon className="h-4 w-4 text-primary" />
                </div>
                End
              </div>
            </div>
          </div>
        </div>

        {/* Configuration panel */}
        {selectedNode && (
          <div className="absolute right-4 top-4 w-80 overflow-y-auto rounded-xl bg-card">
            <NodeConfigurationPanel
              node={selectedNode}
              onNodeUpdate={handleNodeUpdate}
              onNodeDelete={handleNodeDelete}
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <RunFlowDialog open={runDialogOpen} onOpenChange={setRunDialogOpen} flow={flow} />
      <ImportFlowDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
      <ApiKeyDialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen} />
    </div>
  );
}
