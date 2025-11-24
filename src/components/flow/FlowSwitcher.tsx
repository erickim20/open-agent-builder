import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
import { getFlowsFromStorage, deleteFlowFromStorage } from '@/lib/flowStorage';
import type { Flow } from '@/types/flow';
import { ChevronDown, FileText, PlusIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FlowSwitcherProps {
  currentFlow: Flow;
  onFlowSelect: (flow: Flow) => void;
  onNewFlow: () => void;
  onFlowNameChange: (name: string) => void;
}

export function FlowSwitcher({
  currentFlow,
  onFlowSelect,
  onNewFlow,
  onFlowNameChange
}: FlowSwitcherProps) {
  const [flows, setFlows] = useState<Flow[]>([]);

  useEffect(() => {
    loadFlows();
  }, []);

  useEffect(() => {
    loadFlows();
  }, [currentFlow.id]);

  const loadFlows = () => {
    const allFlows = getFlowsFromStorage();
    setFlows(allFlows);
  };

  const handleFlowSelect = (flow: Flow) => {
    onFlowSelect(flow);
  };

  const handleDeleteFlow = (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (flows.length <= 1) {
      toast.error('Cannot delete the last flow');
      return;
    }
    if (currentFlow.id === flowId) {
      toast.error('Cannot delete the current flow. Please switch to another flow first.');
      return;
    }
    if (confirm('Are you sure you want to delete this flow?')) {
      deleteFlowFromStorage(flowId);
      loadFlows();
      toast.success('Flow deleted');
    }
  };

  return (
    <InputGroup className="w-64">
      <InputGroupInput
        value={currentFlow.name}
        onChange={(e) => onFlowNameChange(e.target.value)}
        placeholder="Flow name"
        className="font-semibold"
      />
      <InputGroupAddon align="inline-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            {flows.length === 0 ? (
              <DropdownMenuItem disabled className="text-muted-foreground">
                No flows available
              </DropdownMenuItem>
            ) : (
              flows.map((flow) => (
                <DropdownMenuItem
                  key={flow.id}
                  onClick={() => handleFlowSelect(flow)}
                  className="flex items-center justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{flow.name || 'Untitled Flow'}</span>
                  </div>
                  {flow.id === currentFlow.id && (
                    <span className="ml-2 text-xs text-muted-foreground">Current</span>
                  )}
                  {flow.id !== currentFlow.id && flows.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => handleDeleteFlow(flow.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onNewFlow}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Flow
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </InputGroupAddon>
    </InputGroup>
  );
}
