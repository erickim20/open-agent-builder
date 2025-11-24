import { BotIcon } from 'lucide-react';

interface AgentNodeCardProps {
  onClick: () => void;
}

export function AgentNodeCard({ onClick }: AgentNodeCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl p-2 transition-colors hover:bg-muted"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
        <BotIcon className="h-4 w-4 text-accent" />
      </div>
      Agent
    </div>
  );
}

