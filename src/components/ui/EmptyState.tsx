import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl border border-line bg-surface text-accent [&_svg]:size-5">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {description && <p className="max-w-xs text-sm text-fg-muted">{description}</p>}
      {action}
    </div>
  );
}
