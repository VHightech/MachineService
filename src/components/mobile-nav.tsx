"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { NAV, isNavActive } from "@/components/sidebar";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="panel mb-3 p-2.5 md:hidden">
      <div className="flex items-center gap-2 px-1.5 pb-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-accent">
          <Wrench size={16} strokeWidth={2.5} />
        </span>
        <p className="font-display text-[16px] font-semibold tracking-tight">
          Officina
        </p>
      </div>
      <nav className="flex gap-1 overflow-x-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "bg-accent text-accent-ink"
                  : "text-muted hover:bg-surface-2",
              )}
            >
              <Icon size={16} strokeWidth={2.2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
