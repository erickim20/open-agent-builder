import { SquareIcon } from 'lucide-react';

interface EndNodeCardProps {
  onClick: () => void;
}

export function EndNodeCard({ onClick }: EndNodeCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl p-2 transition-colors hover:bg-muted"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
        <SquareIcon className="h-4 w-4 text-destructive" />
      </div>
      End
    </div>
  );
}

