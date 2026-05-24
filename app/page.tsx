"use client";

import Link from "next/link";
import { useAuth, apiJson } from "@/lib/auth-context";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { University } from "@/lib/types";
import { UniLogo } from "@/components/UniLogo";
import { Wordmark } from "@/components/Wordmark";

// Earliest upcoming deadline used by the hero "live" pill.
const NEXT_DEADLINE_FALLBACK = new Date("2026-08-15T00:00:00Z");

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [unis, setUnis] = useState<University[]>([]);

  useEffect(() => {
    if (!loading && user) {
      router.push(
        user.role === "STUDENT" ? "/dashboard" : "/admin/universitet",
      );
    }
  }, [user, loading, router]);

  useEffect(() => {
    apiJson<University[]>("/api/universities").then(setUnis).catch(() => {});
  }, []);

  // Computed only after mount to avoid SSR/client time mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const daysLeft = useMemo(() => {
    if (!mounted) return null;
    const next = unis
      .map((u) => new Date(u.deadline).getTime())
      .filter((t) => t > Date.now())
      .sort((a, b) => a - b)[0];
    const target = next ?? NEXT_DEADLINE_FALLBACK.getTime();
    return Math.max(0, Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [unis, mounted]);

  return (
    <div>
      {/* ─── HERO ─── */}
      <section
        className="relative flex items-center"
        style={{
          minHeight: "calc(100vh - 76px)",
          backgroundImage: "url('/universities/bmu.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Layered overlays for strong text contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(8,6,4,0.92) 0%, rgba(8,6,4,0.78) 45%, rgba(8,6,4,0.45) 80%, rgba(8,6,4,0.30) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.35) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 py-24 w-full">
          {/* Eyebrow */}
          <p className="font-mono text-[11px] tracking-[0.18em] text-white/50 uppercase mb-7 animate-fade-in-up">
            O&apos;zbekistondagi xususiy universitetlarga yagona ariza
          </p>

          {/* Headline */}
          <h1
            className="font-bold leading-[1.0] tracking-tight text-white mb-8 animate-fade-in-up"
            style={{
              fontSize: "clamp(52px, 9vw, 108px)",
              animationDelay: "60ms",
            }}
          >
            <span className="text-primary">Bittada</span>
            <br />
            universitetga
            <br />
            topshiring.
          </h1>

          {/* Sub */}
          <p
            className="text-[17px] sm:text-[19px] text-white/70 max-w-[44ch] leading-[1.6] mb-10 animate-fade-in-up"
            style={{ animationDelay: "120ms" }}
          >
            Westminster, Inha, Ajou, MDIS va boshqa xususiy universitetlarga
            arizalarni bitta profil orqali yuboring. Hujjatlar bir marta —
            qaror shu yerda.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap gap-4 animate-fade-in-up"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/royxat"
              className="inline-flex items-center gap-2.5 px-8 rounded-md bg-primary text-white text-[16px] font-semibold hover:bg-primary-active transition-colors"
              style={{ height: 54 }}
            >
              Ro&apos;yxatdan o&apos;tish
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 7h12m0 0L8 2m5 5l-5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/kirish"
              className="inline-flex items-center px-8 rounded-md border border-white/30 text-white text-[16px] font-semibold hover:bg-white/10 transition-colors"
              style={{ height: 54 }}
            >
              Profilingizga kiring
            </Link>
          </div>

          {/* Stats */}
          <div
            className="mt-16 flex flex-wrap gap-10 animate-fade-in-up"
            style={{ animationDelay: "260ms" }}
          >
            {[
              { n: `${Math.max(unis.length, 6)}+`, l: "Universitet" },
              { n: "1 ta", l: "Profil, barchasi uchun" },
              { n: "9 min", l: "O'rtacha to'ldirish" },
              ...(daysLeft !== null
                ? [{ n: `${daysLeft}`, l: "Kun qoldi" }]
                : []),
            ].map((s) => (
              <div key={s.l}>
                <div className="text-white font-bold leading-none mb-1.5" style={{ fontSize: 34 }}>
                  {s.n}
                </div>
                <div className="font-mono text-[11px] tracking-[0.12em] text-white/45 uppercase">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2 text-white/35 animate-fade-in">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
            <path
              d="M7 1v20M7 21l-5-5M7 21l5-5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* ─── UNIVERSITIES ─── */}
      {unis.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-8 pt-12 pb-24" id="universitetlar">
          <div className="flex items-baseline justify-between flex-wrap gap-6 mb-8">
            <div>
              <div className="eyebrow mb-2">[01] &nbsp; Platformadagi universitetlar</div>
              <h2 className="display-heading text-[32px] sm:text-[36px] m-0 max-w-[22ch]">
                To&apos;rt universitet bilan boshlandi.{" "}
                <span className="serif-italic text-muted">Davom etmoqda.</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 border-t border-l border-hairline">
            {unis.slice(0, 8).map((u, i) => (
              <Link
                href={`/universitetlar/${u.slug}`}
                key={u.id}
                className="border-r border-b border-hairline p-6 sm:p-7 flex flex-col gap-4 min-h-[260px] bg-canvas hover:bg-surface-soft transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-muted-soft">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[10.5px] tracking-[0.08em] text-muted uppercase">
                    qabul ochiq
                  </span>
                </div>

                <div className="aspect-[1.4/1] rounded-sm overflow-hidden bg-surface-soft flex items-center justify-center">
                  <UniLogo
                    logo={u.logo}
                    alt={u.shortName}
                    className="w-full h-full object-cover"
                    textClassName="text-4xl font-bold text-ink/25"
                  />
                </div>

                <div className="mt-auto">
                  <div className="display-heading text-[20px] leading-tight mb-1">
                    {u.shortName}
                  </div>
                  <div className="text-[13px] text-muted">{u.city}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── HOW IT WORKS ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 py-24" id="qanday">
        <div className="mb-14">
          <div className="eyebrow mb-2">[02] &nbsp; Qanday ishlaydi</div>
          <h2 className="display-heading text-[32px] sm:text-[44px] m-0 max-w-[20ch]">
            Uchta qadam.{" "}
            <span className="serif-italic text-muted">O&apos;rtacha o&apos;n daqiqa.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 border-t border-hairline">
          {[
            {
              n: "01",
              t: "Profilingizni to'ldiring",
              d: "Pasport, diplom, DTM va xalqaro test ballarini bir marta yuklang. Har bir universitet uchun qayta yozish shart emas.",
              detail: "Hujjat formati avtomatik tekshiriladi",
            },
            {
              n: "02",
              t: "Universitetlarni tanlang",
              d: "Yo'nalish, ta'lim tili, joy, narx va imtihon talablari bo'yicha filtrlang. Mos kelganlarini ro'yxatga qo'shing.",
              detail: "Talablar bo'yicha avtomatik moslik",
            },
            {
              n: "03",
              t: "Bir tugma bilan yuboring",
              d: "Tanlangan barcha universitetlarga arizalaringizni bittada yuboring. Har bir holat real vaqtda ko'rinadi.",
              detail: "Excel eksport va imtihon ro'yxati ham shu yerda",
            },
          ].map((s, i, arr) => (
            <div
              key={s.n}
              className={`py-10 px-8 first:pl-0 last:pr-0 flex flex-col gap-4 min-h-[300px] ${
                i < arr.length - 1 ? "sm:border-r border-hairline" : ""
              }`}
            >
              <div
                className="serif-italic text-primary leading-none"
                style={{
                  fontSize: 80,
                  fontWeight: 500,
                  letterSpacing: "-0.04em",
                }}
              >
                {s.n}
              </div>
              <h3 className="display-heading text-[22px] m-0">{s.t}</h3>
              <p className="text-[15px] text-body leading-[1.6] m-0">{s.d}</p>
              <div className="mt-auto pt-4 border-t border-hairline-soft eyebrow">
                ↳ {s.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-14">
          <div className="flex items-start justify-between flex-wrap gap-8">
            <div className="max-w-[32ch]">
              <Wordmark size={32} />
              <p className="mt-4 text-[14px] leading-[1.55] text-muted">
                O&apos;zbekistondagi xususiy universitetlarga ariza topshirishning
                yagona platformasi.
              </p>
            </div>
            <div className="flex gap-12 flex-wrap">
              {[
                {
                  h: "Talabalar uchun",
                  l: [
                    { label: "Ro'yxatdan o'tish", href: "/royxat" },
                    { label: "Kirish", href: "/kirish" },
                  ],
                },
                {
                  h: "Universitetlar uchun",
                  l: [{ label: "Admin paneli", href: "/admin/kirish" }],
                },
              ].map((col) => (
                <div key={col.h}>
                  <div className="eyebrow mb-4">{col.h}</div>
                  <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                    {col.l.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-[14px] text-ink/80 hover:text-primary"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-hairline flex justify-between flex-wrap gap-3 font-mono text-[12px] tracking-[0.02em] text-muted uppercase">
            <span>© 2026 BITTADA — Toshkent</span>
            <span>Uz · Ru · En</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
