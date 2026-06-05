import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "outline"
  | "ghost"
  | "danger"
  | "dangerSolid";
export type ButtonSize = "sm" | "md" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-accent hover:text-accent-ink",
  accent: "bg-accent text-accent-ink hover:bg-accent-strong",
  outline:
    "border border-line bg-surface text-ink hover:border-accent-strong hover:bg-accent hover:text-accent-ink",
  ghost: "text-muted hover:bg-accent-soft hover:text-accent-ink",
  danger: "bg-danger-soft text-danger-ink hover:bg-danger/15",
  dangerSolid: "bg-danger text-white hover:bg-danger/90",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-10 px-[18px] text-[14px]",
  icon: "h-9 w-9",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    "group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
