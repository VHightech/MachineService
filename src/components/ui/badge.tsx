import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "accent" | "danger" | "teal";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-muted",
  accent: "bg-accent-soft text-accent-ink",
  danger: "bg-danger-soft text-danger-ink",
  teal: "bg-teal-soft text-teal",
};

const DOT: Record<BadgeTone, string> = {
  neutral: "bg-faint",
  accent: "bg-accent-strong",
  danger: "bg-danger",
  teal: "bg-teal",
};

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT[tone])} />
      )}
      {children}
    </span>
  );
}
