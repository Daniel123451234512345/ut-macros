"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Menu", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/today", label: "Today", icon: "M12 3v18M3 12h18" },
  { href: "/history", label: "History", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { href: "/settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 12h2m12 0h2M12 4v2m0 12v2" },
];

export default function BottomTabs() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={t.icon} />
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
