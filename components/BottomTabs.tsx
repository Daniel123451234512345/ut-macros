"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Menu", icon: <path d="M4 6h16M4 12h16M4 18h10" /> },
  {
    href: "/today",
    label: "Today",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  },
  { href: "/history", label: "History", icon: <path d="M5 20V11M12 20V5M19 20v-6" /> },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </>
    ),
  },
];

/** Floating charcoal tab bar; the current tab is a burnt-orange pill. */
export default function BottomTabs() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <ul className="mx-auto grid max-w-xl grid-cols-4 gap-1 rounded-3xl bg-nav p-2 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-13 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] ${
                  active ? "bg-accent font-bold text-on-accent" : "font-medium text-nav-fg"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {t.icon}
                </svg>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
