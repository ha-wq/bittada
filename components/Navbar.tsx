"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

const PROTECTED_LINKS = [
  { href: "/dashboard", label: "Universitetlar" },
  { href: "/arizalar", label: "Mening arizalarim" },
  { href: "/imtihonlar", label: "Imtihonlar" },
  { href: "/profil", label: "Profil" },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-canvas border-b border-hairline">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 h-20 flex items-center justify-between gap-6">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
            B
          </span>
          <span className="text-xl font-semibold tracking-tight">bittada</span>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {PROTECTED_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-[15px] font-medium transition-colors ${
                    active
                      ? "bg-surface-strong text-ink"
                      : "text-muted hover:text-ink hover:bg-surface-soft"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 border border-hairline rounded-full pl-3 pr-1 py-1 hover:shadow-card transition-shadow"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-ink">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white text-sm font-semibold">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-canvas border border-hairline rounded-md shadow-card overflow-hidden z-20 py-2">
                    <div className="px-4 py-3 border-b border-hairline-soft">
                      <div className="font-semibold text-ink">{user.fullName}</div>
                      <div className="text-sm text-muted truncate">{user.email}</div>
                    </div>
                    <div className="md:hidden border-b border-hairline-soft py-2">
                      {PROTECTED_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2 text-[15px] text-ink hover:bg-surface-soft"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-3 text-[15px] text-ink hover:bg-surface-soft"
                    >
                      Chiqish
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/kirish"
                className="hidden sm:inline-flex h-10 items-center px-4 rounded-full text-[15px] font-medium text-ink hover:bg-surface-soft"
              >
                Kirish
              </Link>
              <Link
                href="/royxat"
                className="inline-flex h-10 items-center px-5 rounded-md bg-primary text-white text-[15px] font-medium hover:bg-primary-active transition-colors"
              >
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
