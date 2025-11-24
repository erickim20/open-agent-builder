import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Pencil, Play } from 'lucide-react';

interface ModeToggleProps {
  mode: 'edit' | 'preview';
  onModeChange: (mode: 'edit' | 'preview') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => {
        if (value === 'edit' || value === 'preview') {
          onModeChange(value);
        }
      }}
      className="rounded-full bg-background p-1"
    >
      <ToggleGroupItem value="edit" aria-label="Edit mode" className="px-3">
        <Pencil className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="preview" aria-label="Preview mode" className="px-3">
        <Play className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
