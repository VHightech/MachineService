import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-faint">
        <Icon size={24} strokeWidth={2} />
      </span>
      <p className="mt-4 font-display text-[18px] font-semibold text-ink">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-sm text-[14px] text-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
