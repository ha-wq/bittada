"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/Wordmark";

const STUDENT_LINKS = [
  { href: "/dashboard", label: "Universitetlar" },
  { href: "/skauting", label: "Skauting" },
  { href: "/tavsiya", label: "AI tavsiya" },
  { href: "/arizalar", label: "Arizalarim" },
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

        {user && <AnimatedNav links={links} pathname={pathname} />}

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

// ─── Animated nav with sliding active-pill + hover-pill indicator ───
type NavLink = { href: string; label: string };

function AnimatedNav({ links, pathname }: { links: NavLink[]; pathname: string }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [activeBox, setActiveBox] = useState<{ left: number; width: number } | null>(null);
  const [hoverBox, setHoverBox] = useState<{ left: number; width: number } | null>(null);

  const activeHref =
    links.find(
      (l) => pathname === l.href || pathname.startsWith(l.href + "/"),
    )?.href ?? null;

  // Position the active pill whenever the route changes or layout shifts.
  useLayoutEffect(() => {
    if (!activeHref || !containerRef.current) {
      setActiveBox(null);
      return;
    }
    const el = linkRefs.current.get(activeHref);
    const containerRect = containerRef.current.getBoundingClientRect();
    if (!el) {
      setActiveBox(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setActiveBox({ left: rect.left - containerRect.left, width: rect.width });
  }, [activeHref, links]);

  // Recompute on window resize.
  useEffect(() => {
    const onResize = () => {
      if (!activeHref || !containerRef.current) return;
      const el = linkRefs.current.get(activeHref);
      if (!el) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setActiveBox({ left: rect.left - containerRect.left, width: rect.width });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeHref]);

  const onLinkEnter = (href: string) => {
    if (!containerRef.current) return;
    const el = linkRefs.current.get(href);
    if (!el) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setHoverBox({ left: rect.left - containerRect.left, width: rect.width });
  };

  return (
    <nav
      ref={containerRef}
      onMouseLeave={() => setHoverBox(null)}
      className="hidden md:flex items-center gap-1 relative"
    >
      {/* Sliding hover pill (subtle) */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-9 rounded-full bg-surface-soft transition-all duration-300 ease-out"
        style={{
          left: hoverBox?.left ?? 0,
          width: hoverBox?.width ?? 0,
          opacity: hoverBox ? 1 : 0,
        }}
      />
      {/* Sliding active pill (stronger) */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-9 rounded-full bg-surface-strong transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: activeBox?.left ?? 0,
          width: activeBox?.width ?? 0,
          opacity: activeBox ? 1 : 0,
        }}
      />
      {links.map((link) => {
        const isActive = link.href === activeHref;
        return (
          <Link
            key={link.href}
            href={link.href}
            ref={(node) => {
              if (node) linkRefs.current.set(link.href, node);
              else linkRefs.current.delete(link.href);
            }}
            onMouseEnter={() => onLinkEnter(link.href)}
            className={`relative z-10 px-4 py-2 rounded-full text-[15px] font-medium transition-colors duration-200 ${
              isActive ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
