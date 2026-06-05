import { Plus, type LucideIcon } from "lucide-react";

interface SquareTriggerProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

/**
 * Bottone quadrato (card "Aggiungi" della dashboard): nero con icona + etichetta.
 * In alto a destra un "+"; in hover diventa un cerchio verde con il "+" nero.
 */
export function SquareTrigger({ icon: Icon, label, onClick }: SquareTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/btn relative flex h-full min-h-[92px] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-ink px-1 py-3 text-white transition-colors duration-200 hover:bg-ink/95"
    >
      <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full text-white/70 transition-all duration-200 group-hover/btn:scale-110 group-hover/btn:bg-accent group-hover/btn:text-ink">
        <Plus size={12} strokeWidth={3} />
      </span>
      <Icon size={20} strokeWidth={2.1} />
      <span className="text-center text-[11px] font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}
