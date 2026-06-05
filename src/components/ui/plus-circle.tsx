import { Plus } from "lucide-react";

/**
 * "+" che all'hover del bottone si trasforma in un cerchio nero
 * con il "+" verde lime. A riposo è solo il "+" (eredita il colore del testo).
 */
export function PlusCircle() {
  return (
    <span className="grid size-5 place-items-center rounded-full transition-colors duration-200 group-hover/btn:bg-ink group-hover/btn:text-accent">
      <Plus size={13} strokeWidth={2.6} />
    </span>
  );
}
