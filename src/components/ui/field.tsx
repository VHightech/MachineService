import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FIELD_BASE =
  "w-full rounded-2xl border border-line bg-surface text-[14px] text-ink placeholder:text-faint transition-colors focus:border-ink/20 focus:outline-none focus:ring-4 focus:ring-accent/30 disabled:opacity-60";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-[13px] font-medium text-ink", className)}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD_BASE, "h-11 px-3.5", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(FIELD_BASE, "min-h-[88px] resize-y px-3.5 py-2.5", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(FIELD_BASE, "h-11 cursor-pointer appearance-none px-3.5 pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-faint"
      />
    </div>
  );
}

export function FieldRow({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-faint">{hint}</p>}
    </div>
  );
}
