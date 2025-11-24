import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FlowCanvas } from './FlowCanvas';
import { NodeConfigurationPanel } from './NodeConfigurationPanel';
import { FlowSwitcher } from './FlowSwitcher';
import { ModeToggle } from './ModeToggle';
import { PreviewChatPanel } from './PreviewChatPanel';
import { ImportFlowDialog } from './ImportFlowDialog';
import { ApiKeyDialog } from './ApiKeyDialog';
import { AgentNodeCard } from './cards/AgentNodeCard';
import { EndNodeCard } from './cards/EndNodeCard';
import { NotesNodeCard } from './cards/NotesNodeCard';
import {
  saveFlowToStorage,
  getCurrentFlowFromStorage,
  getFlowsFromStorage,
  deleteFlowFromStorage,
  exportFlowAsJSON
} from '@/lib/flowStorage';
import type { Flow, Node, AgentNode, EndNode, NotesNode } from '@/types/flow';
import { toast } from 'sonner';
import { MoreHorizontal, Key } from 'lucide-react';
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
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [streamingAgentIds, setStreamingAgentIds] = useState<Set<string>>(new Set());

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

  const handleAddNotes = useCallback(() => {
    const newNotes: NotesNode = {
      id: `notes-${crypto.randomUUID()}`,
      type: 'notes',
      label: 'Note',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 200
      },
      content: ''
    };

    setFlow({
      ...flow,
      nodes: [...flow.nodes, newNotes]
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

  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      // In preview mode, clicking a node switches back to edit mode
      if (mode === 'preview' && nodeId) {
        setMode('edit');
      }
      setSelectedNodeId(nodeId);
    },
    [mode]
  );

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
          <div className="absolute left-1/2 -translate-x-1/2">
            <ModeToggle mode={mode} onModeChange={setMode} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setApiKeyDialogOpen(true)}
              title="OpenAI API Key Settings"
              className="h-9 w-9"
            >
              <Key className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="secondary" size="sm" className="h-9 w-9">
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
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedNodeId}
            onNodeUpdate={handleNodeUpdate}
            previewMode={mode === 'preview'}
            streamingAgentIds={streamingAgentIds}
          />
        </div>

        {mode === 'edit' ? (
          <>
            {/* Node types card */}
            <div className="absolute left-4 top-4 w-80 overflow-y-auto rounded-xl bg-card">
              <div className="p-2">
                <h2 className="p-2 text-sm font-medium text-muted-foreground">Core</h2>
                <div className="space-y-2">
                  <AgentNodeCard onClick={handleAddAgent} />
                  <EndNodeCard onClick={handleAddEnd} />
                </div>
                <h2 className="p-2 pt-4 text-sm font-medium text-muted-foreground">Tools</h2>
                <div className="space-y-2">
                  <NotesNodeCard onClick={handleAddNotes} />
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
          </>
        ) : (
          /* Preview chat panel */
          <div className="absolute bottom-4 right-4 top-4 w-96 rounded-xl bg-card shadow-lg">
            <PreviewChatPanel
              flow={flow}
              onNodeSelect={handleNodeSelect}
              onStreamingAgentsChange={setStreamingAgentIds}
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ImportFlowDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
      <ApiKeyDialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen} />
    </div>
  );
}
