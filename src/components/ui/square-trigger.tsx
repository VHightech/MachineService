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
      className="group/btn relative flex h-full min-h-[104px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl bg-ink px-2 py-4 text-white transition-colors duration-200 hover:bg-ink/95"
    >
      <span className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full text-white/70 transition-all duration-200 group-hover/btn:scale-110 group-hover/btn:bg-accent group-hover/btn:text-ink">
        <Plus size={15} strokeWidth={3} />
      </span>
      <Icon size={28} strokeWidth={2} />
      <span className="text-center text-[13px] font-semibold leading-tight">
        {label}
      </span>
    </button>
  );
}
