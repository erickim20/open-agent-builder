import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FlowCanvas } from "./FlowCanvas";
import { NodeConfigurationPanel } from "./NodeConfigurationPanel";
import { runFlow } from "@/lib/runtime";
import {
  saveFlowToStorage,
  getCurrentFlowFromStorage,
  exportFlowAsJSON,
  importFlowFromJSON,
} from "@/lib/flowStorage";
import type { Flow, Node, AgentNode, EndNode, FlowRunResult } from "@/types/flow";
import { toast } from "sonner";
import { Play, Plus, Download, Upload, FilePlus } from "lucide-react";

function createDefaultFlow(): Flow {
  const startNode: Node = {
    id: "start-1",
    type: "start",
    label: "Start",
    position: { x: 250, y: 50 },
    inputSchema: {
      prompt: "",
    },
  };

  return {
    id: crypto.randomUUID(),
    name: "New Flow",
    nodes: [startNode],
    edges: [],
  };
}

export function FlowBuilder() {
  const [flow, setFlow] = useState<Flow>(() => {
    const saved = getCurrentFlowFromStorage();
    return saved || createDefaultFlow();
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [runPrompt, setRunPrompt] = useState("");
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
      const updatedNodes = flow.nodes.map((n) =>
        n.id === updatedNode.id ? updatedNode : n
      );
      setFlow({ ...flow, nodes: updatedNodes });
    },
    [flow]
  );

  const handleAddAgent = useCallback(() => {
    const newAgent: AgentNode = {
      id: `agent-${crypto.randomUUID()}`,
      type: "agent",
      label: "New Agent",
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 200,
      },
      model: "gpt-4o",
      systemPrompt: "",
      temperature: 0.7,
      maxTokens: 2000,
    };

    setFlow({
      ...flow,
      nodes: [...flow.nodes, newAgent],
    });
  }, [flow]);

  const handleAddEnd = useCallback(() => {
    const newEnd: EndNode = {
      id: `end-${crypto.randomUUID()}`,
      type: "end",
      label: "End",
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 400,
      },
    };

    setFlow({
      ...flow,
      nodes: [...flow.nodes, newEnd],
    });
  }, [flow]);

  const handleRunFlow = useCallback(async () => {
    if (!runPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsRunning(true);
    setRunResult(null);

    try {
      const result = await runFlow(flow, { prompt: runPrompt });
      setRunResult(result);
      toast.success("Flow executed successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to run flow"
      );
    } finally {
      setIsRunning(false);
    }
  }, [flow, runPrompt]);

  const handleExport = useCallback(() => {
    try {
      exportFlowAsJSON(flow);
      toast.success("Flow exported successfully");
    } catch (error) {
      toast.error("Failed to export flow");
    }
  }, [flow]);

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const importedFlow = await importFlowFromJSON(file);
        setFlow(importedFlow);
        setSelectedNodeId(null);
        toast.success("Flow imported successfully");
        setImportDialogOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to import flow"
        );
      }
    },
    []
  );

  const handleNewFlow = useCallback(() => {
    if (confirm("Create a new flow? Current flow will be saved automatically.")) {
      const newFlow = createDefaultFlow();
      setFlow(newFlow);
      setSelectedNodeId(null);
      toast.success("New flow created");
    }
  }, []);

  const selectedNode = flow.nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <div className="border-b bg-background px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              value={flow.name}
              onChange={(e) => setFlow({ ...flow, name: e.target.value })}
              className="w-48 font-semibold"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleNewFlow} size="sm">
              <FilePlus className="h-4 w-4 mr-2" />
              New Flow
            </Button>
            <Button variant="outline" onClick={handleAddAgent} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
            <Button variant="outline" onClick={handleAddEnd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add End
            </Button>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={handleExport} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setRunDialogOpen(true)} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Run Flow
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1">
          <FlowCanvas
            flow={flow}
            onFlowChange={handleFlowChange}
            onNodeSelect={setSelectedNodeId}
            selectedNodeId={selectedNodeId}
          />
        </div>

        {/* Configuration panel */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          <Card className="border-0 rounded-none h-full">
            <CardHeader>
              <CardTitle>Node Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <NodeConfigurationPanel
                node={selectedNode}
                onNodeUpdate={handleNodeUpdate}
              />
            </CardContent>
          </Card>
        </div>
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
                  const agentNode = flow.nodes.find(
                    (n) => n.id === agentId
                  ) as AgentNode;
                  return (
                    <Card key={agentId}>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {agentNode?.label || agentId}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm whitespace-pre-wrap">
                          {result.output}
                        </div>
                        {result.raw?.error && (
                          <div className="text-sm text-destructive mt-2">
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
                setRunPrompt("");
              }}
            >
              Close
            </Button>
            <Button onClick={handleRunFlow} disabled={isRunning}>
              {isRunning ? "Running..." : "Run"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Flow</DialogTitle>
            <DialogDescription>
              Select a JSON file to import a flow.
            </DialogDescription>
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
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

