"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { Wordmark } from "@/components/Wordmark";

const STUDENT_LINKS = [
  { href: "/dashboard", label: "Universitetlar" },
  { href: "/arizalar", label: "Mening arizalarim" },
  { href: "/imtihonlar", label: "Imtihonlar" },
  { href: "/profil", label: "Profil" },
];

const ADMIN_LINKS = [
  { href: "/admin/universitet", label: "Universitet" },
  { href: "/admin/imtihonlar", label: "Imtihonlar" },
  { href: "/admin/arizalar", label: "Arizalar" },
];

const SUPER_ADMIN_LINKS = [
  ...ADMIN_LINKS,
  { href: "/admin/super", label: "Foydalanuvchilar" },
];

const PARENT_LINKS = [{ href: "/ota-ona", label: "Farzandlarim" }];

export function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    router.push("/");
  };

  // Hide nav on admin login page and inside the Telegram Mini App.
  if (pathname === "/admin/kirish") return null;
  if (pathname === "/tg" || pathname.startsWith("/tg/")) return null;

  const links =
    user?.role === "SUPER_ADMIN"
      ? SUPER_ADMIN_LINKS
      : user?.role === "UNIVERSITY_ADMIN"
        ? ADMIN_LINKS
        : user?.role === "PARENT"
          ? PARENT_LINKS
          : STUDENT_LINKS;

  const isAdmin = user?.role === "UNIVERSITY_ADMIN" || user?.role === "SUPER_ADMIN";
  const isParent = user?.role === "PARENT";

  return (
    <header
      className="sticky top-0 z-30 border-b border-hairline"
      style={{
        background:
          "color-mix(in oklab, var(--color-canvas) 88%, transparent)",
        backdropFilter: "saturate(140%) blur(14px)",
        WebkitBackdropFilter: "saturate(140%) blur(14px)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 h-[76px] flex items-center justify-between gap-6">
        <Link
          href={
            user
              ? isAdmin
                ? "/admin/universitet"
                : user.role === "PARENT"
                  ? "/ota-ona"
                  : "/dashboard"
              : "/"
          }
          className="flex items-center gap-2"
        >
          <Wordmark size={26} />
          {isAdmin && (
            <span className="ml-2 text-[11px] font-bold uppercase tracking-wide bg-ink text-white px-2 py-0.5 rounded">
              Admin
            </span>
          )}
          {isParent && (
            <span className="ml-2 text-[11px] font-bold uppercase tracking-wide bg-primary text-white px-2 py-0.5 rounded">
              Ota-ona
            </span>
          )}
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/");
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
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{user.fullName}</span>
                        {isParent && (
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Ota-ona
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted truncate">{user.email}</div>
                    </div>
                    <div className="md:hidden border-b border-hairline-soft py-2">
                      {links.map((link) => (
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
                Profilingizga kiring
              </Link>
              <Link
                href="/royxat"
                className="inline-flex h-10 items-center px-5 rounded-md bg-primary text-white text-[15px] font-medium hover:bg-primary-active transition-colors"
              >
                Universitetga topshiring
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
