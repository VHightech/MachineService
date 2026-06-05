import type { LucideIcon } from "lucide-react";

interface SquareTriggerProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

/** Bottone quadrato (per la card "Aggiungi" della dashboard): nero, hover verde. */
export function SquareTrigger({ icon: Icon, label, onClick }: SquareTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/btn flex h-full min-h-[88px] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-ink px-1 py-3 text-white transition-colors duration-200 hover:bg-accent hover:text-accent-ink"
    >
      <Icon size={20} strokeWidth={2.1} />
      <span className="text-center text-[11px] font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}
