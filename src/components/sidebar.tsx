"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Boxes,
  Factory,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/manutenzioni", label: "Storico Manutenzioni", icon: Wrench },
  { href: "/magazzino", label: "Magazzino", icon: Boxes },
  { href: "/macchine", label: "Macchine", icon: Factory },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Etichette: nascoste quando la barra è chiusa, compaiono in hover.
const REVEAL =
  "overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-100";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "group sticky top-0 z-40 hidden h-screen w-[72px] shrink-0 flex-col overflow-hidden border-r border-line bg-surface px-3 py-3 md:flex",
        "transition-[width] duration-300 ease-out hover:w-[260px]",
      )}
    >
        {/* Brand */}
        <div className="flex items-center gap-3 px-1.5 py-1.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-ink text-accent">
            <Wrench size={18} strokeWidth={2.5} />
          </span>
          <div className={cn("leading-tight", REVEAL)}>
            <p className="font-display text-[17px] font-semibold tracking-tight text-ink">
              Officina
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-6 flex flex-col gap-1">
          <p
            className={cn(
              "px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint",
              REVEAL,
            )}
          >
            Menu
          </p>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "group/item flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-ink"
                    : "text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={2.2}
                  className={cn(
                    "shrink-0",
                    active
                      ? "text-accent-ink"
                      : "text-faint group-hover/item:text-ink",
                  )}
                />
                <span className={REVEAL}>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
  );
}
