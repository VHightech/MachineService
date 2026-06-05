import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
}

export function Card({ className, as: Tag = "div", ...props }: CardProps) {
  return <Tag className={cn("panel p-5 md:p-6", className)} {...props} />;
}
