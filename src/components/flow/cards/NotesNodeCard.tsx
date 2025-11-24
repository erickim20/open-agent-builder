import { StickyNote } from 'lucide-react';

interface NotesNodeCardProps {
  onClick: () => void;
}

export function NotesNodeCard({ onClick }: NotesNodeCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl p-2 transition-colors hover:bg-muted"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
        <StickyNote className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      </div>
      Notes
    </div>
  );
}

