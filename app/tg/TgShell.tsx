"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTg } from "./tg-context";
import { TgLogin } from "./TgLogin";

const TABS = [
  { href: "/tg", label: "Universitetlar", icon: "M3 9.5 12 3l9 6.5M5 8.5V20h14V8.5" },
  { href: "/tg/arizalar", label: "Arizalar", icon: "M6 3h9l4 4v14H6zM14 3v5h5" },
  { href: "/tg/imtihonlar", label: "Imtihonlar", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/tg/profil", label: "Profil", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0" },
];

export function TgShell({ children }: { children: React.ReactNode }) {
  const { phase } = useTg();
  const pathname = usePathname();

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3 text-muted">
          <span className="h-8 w-8 rounded-full border-2 border-hairline border-t-primary animate-spin" />
          <span className="text-[14px]">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (phase === "need-login") {
    return <TgLogin />;
  }

  return (
    <div className="min-h-screen bg-canvas pb-[72px]">
      <div className="mx-auto max-w-lg">{children}</div>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-canvas/95 backdrop-blur border-t border-hairline"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto max-w-lg grid grid-cols-4">
          {TABS.map((t) => {
            const active =
              t.href === "/tg"
                ? pathname === "/tg"
                : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={t.icon} />
                </svg>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
