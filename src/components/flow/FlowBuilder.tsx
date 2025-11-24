import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FlowCanvas } from './FlowCanvas';
import { NodeConfigurationPanel } from './NodeConfigurationPanel';
import { FlowSwitcher } from './FlowSwitcher';
import { runFlow } from '@/lib/runtime';
import {
  saveFlowToStorage,
  getCurrentFlowFromStorage,
  getFlowsFromStorage,
  deleteFlowFromStorage,
  exportFlowAsJSON,
  importFlowFromJSON
} from '@/lib/flowStorage';
import type { Flow, Node, AgentNode, EndNode, FlowRunResult } from '@/types/flow';
import { toast } from 'sonner';
import { Play, BotIcon, SquareIcon, MoreHorizontal, Trash2 } from 'lucide-react';
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
  const [runPrompt, setRunPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<FlowRunResult | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

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
      model: 'gpt-4o',
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

  const handleRunFlow = useCallback(async () => {
    if (!runPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsRunning(true);
    setRunResult(null);

    try {
      const result = await runFlow(flow, { prompt: runPrompt });
      setRunResult(result);
      toast.success('Flow executed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to run flow');
    } finally {
      setIsRunning(false);
    }
  }, [flow, runPrompt]);

  const handleExport = useCallback(() => {
    try {
      exportFlowAsJSON(flow);
      toast.success('Flow exported successfully');
    } catch {
      toast.error('Failed to export flow');
    }
  }, [flow]);

  const handleImport = useCallback(async (file: File) => {
    try {
      const importedFlow = await importFlowFromJSON(file);
      setFlow(importedFlow);
      setSelectedNodeId(null);
      toast.success('Flow imported successfully');
      setImportDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import flow');
    }
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

      {/* Run Dialog */}
      <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Flow</DialogTitle>
            <DialogDescription>
              Enter the prompt to execute all agents in this flow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="run-prompt">Prompt</Label>
              <Textarea
                id="run-prompt"
                value={runPrompt}
                onChange={(e) => setRunPrompt(e.target.value)}
                className="mt-1"
                rows={4}
                placeholder="Enter your prompt here..."
              />
            </div>
            {runResult && (
              <div className="space-y-2">
                <Label>Results</Label>
                {Object.entries(runResult.agents).map(([agentId, result]) => {
                  const agentNode = flow.nodes.find((n) => n.id === agentId) as AgentNode;
                  return (
                    <Card key={agentId}>
                      <CardHeader>
                        <CardTitle className="text-sm">{agentNode?.label || agentId}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap text-sm">{result.output}</div>
                        {result.raw?.error && (
                          <div className="mt-2 text-sm text-destructive">
                            Error: {result.raw.error}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRunDialogOpen(false);
                setRunResult(null);
                setRunPrompt('');
              }}
            >
              Close
            </Button>
            <Button onClick={handleRunFlow} disabled={isRunning}>
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Flow</DialogTitle>
            <DialogDescription>Select a JSON file to import a flow.</DialogDescription>
          </DialogHeader>
          <div>
            <Input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImport(file);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
