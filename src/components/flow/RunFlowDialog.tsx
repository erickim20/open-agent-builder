import { useState, useCallback, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { runFlow } from '@/lib/runtime';
import type { Flow, AgentNode, FlowRunResult } from '@/types/flow';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

/**
 * Checks if an agent node is connected to an end node
 */
function isAgentConnectedToEnd(flow: Flow, agentId: string): boolean {
  return flow.edges.some(
    (edge) => edge.sourceNodeId === agentId && flow.nodes.some((n) => n.id === edge.targetNodeId && n.type === 'end')
  );
}

interface RunFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flow: Flow;
}

export function RunFlowDialog({ open, onOpenChange, flow }: RunFlowDialogProps) {
  const [runPrompt, setRunPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<FlowRunResult | null>(null);

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

  const handleCopyResult = useCallback(
    async (agentId: string, result: FlowRunResult['agents'][string]) => {
      try {
        const output = result.output || '';
        const error = result.raw?.error ? `\nError: ${result.raw.error}` : '';
        const resultText = `${output}${error}`;

        await navigator.clipboard.writeText(resultText);
        toast.success('Result copied to clipboard');
      } catch {
        toast.error('Failed to copy result to clipboard');
      }
    },
    []
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setRunResult(null);
    setRunPrompt('');
  }, [onOpenChange]);

  // Filter results to only show agents connected to end nodes
  const filteredResults = useMemo(() => {
    if (!runResult) return null;
    const filtered: FlowRunResult['agents'] = {};
    Object.entries(runResult.agents).forEach(([agentId, result]) => {
      if (isAgentConnectedToEnd(flow, agentId)) {
        filtered[agentId] = result;
      }
    });
    return Object.keys(filtered).length > 0 ? { ...runResult, agents: filtered } : null;
  }, [runResult, flow]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card">
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
              className="mt-1 bg-muted"
              rows={4}
              placeholder="Enter your prompt here..."
            />
          </div>
          {filteredResults && (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                <Label>Results</Label>
                {Object.entries(filteredResults.agents).map(([agentId, result]) => {
                  const agentNode = flow.nodes.find((n) => n.id === agentId) as AgentNode;
                  return (
                    <Card key={agentId} className="bg-muted">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{agentNode?.label || agentId}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyResult(agentId, result)}
                            className="h-8 w-8 p-0"
                            title="Copy result to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
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
            </ScrollArea>
          )}
          {runResult && !filteredResults && (
            <div className="text-sm text-muted-foreground">
              No results to display. Agents must be connected to an End node to show output.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleRunFlow} disabled={isRunning}>
            {isRunning ? 'Running...' : 'Run'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



