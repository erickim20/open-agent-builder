import { Hand, MousePointer, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ToolMode = 'pan' | 'select';

interface FlowToolbarProps {
  toolMode: ToolMode;
  onToolModeChange: (mode: ToolMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function FlowToolbar({
  toolMode,
  onToolModeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: FlowToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full bg-card px-2 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className={cn('relative h-8 w-8 rounded-full p-0', toolMode === 'pan' && 'bg-muted')}
          onClick={() => onToolModeChange('pan')}
          title="Pan tool"
        >
          <Hand className="h-4 w-4" />
        </Button>
        {/* <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 w-8 rounded-full p-0', toolMode === 'select' && 'bg-muted')}
          onClick={() => onToolModeChange('select')}
          title="Select tool"
        >
          <MousePointer className="h-4 w-4" />
        </Button> */}
        <div className="mx-1 h-6 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full p-0"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo2 className={cn('h-4 w-4', !canUndo && 'text-muted-foreground')} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full p-0"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo2 className={cn('h-4 w-4', !canRedo && 'text-muted-foreground')} />
        </Button>
      </div>
    </div>
  );
}
