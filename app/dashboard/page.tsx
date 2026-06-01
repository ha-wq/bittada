"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, apiJson } from "@/lib/auth-context";
import { University } from "@/lib/types";
import { UniversityCard, UniversityRow } from "@/components/UniversityCard";

const LANGUAGES = ["O'zbek", "Rus", "Ingliz"] as const;
type Lang = (typeof LANGUAGES)[number];

const PARTS = [
  { v: "kunduzgi", l: "Kunduzgi" },
  { v: "kechki", l: "Kechki" },
  { v: "sirtqi", l: "Sirtqi" },
] as const;
type Part = (typeof PARTS)[number]["v"];

type SortKey = "deadline" | "price-asc" | "price-desc" | "name";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "deadline", label: "Muddat yaqinligi" },
  { value: "price-asc", label: "Arzondan" },
  { value: "price-desc", label: "Qimmatdan" },
  { value: "name", label: "Nomi (A–Z)" },
];

type ViewMode = "grid" | "list";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);

  // Filter state
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>("");
  const [langs, setLangs] = useState<Lang[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [grantOnly, setGrantOnly] = useState(false);
  const [noExamOnly, setNoExamOnly] = useState(false);
  const [maxTuition, setMaxTuition] = useState<number | null>(null);
  const [maxDtm, setMaxDtm] = useState<number | null>(null);
  const [deadlineWithin, setDeadlineWithin] = useState<number | null>(null); // days
  const [sort, setSort] = useState<SortKey>("deadline");
  const [view, setView] = useState<ViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  useEffect(() => {
    apiJson<University[]>("/api/universities")
      .then(setUniversities)
      .finally(() => setLoadingUnis(false));
  }, []);

  const cities = useMemo(
    () => Array.from(new Set(universities.map((u) => u.city))).sort(),
    [universities],
  );

  const filtered = useMemo(() => {
    const list = universities.filter((u) => {
      if (query) {
        const q = query.toLowerCase();
        const matches =
          u.name.toLowerCase().includes(q) ||
          u.shortName.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (city && u.city !== city) return false;
      if (langs.length && !langs.some((l) => u.language.includes(l))) return false;
      if (parts.length) {
        const has = u.majors.some((m) => parts.some((p) => m.partsOfDay.includes(p)));
        if (!has) return false;
      }
      if (grantOnly && !u.offersFinancialAid) return false;
      if (noExamOnly && u.hasEntranceExam) return false;
      if (maxTuition != null && u.tuitionMin > maxTuition) return false;
      if (maxDtm != null && u.minDtm != null && u.minDtm > maxDtm) return false;
      if (deadlineWithin != null) {
        const daysToDeadline = Math.ceil(
          (new Date(u.deadline).getTime() - Date.now()) / 86400000,
        );
        if (daysToDeadline < 0 || daysToDeadline > deadlineWithin) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      switch (sort) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "price-asc":
          return a.tuitionMin - b.tuitionMin;
        case "price-desc":
          return b.tuitionMin - a.tuitionMin;
        case "name":
          return a.name.localeCompare(b.name);
      }
    });
    return list;
  }, [query, city, langs, parts, grantOnly, noExamOnly, maxTuition, maxDtm, deadlineWithin, sort, universities]);

  const activeFilterCount =
    (city ? 1 : 0) +
    langs.length +
    parts.length +
    (grantOnly ? 1 : 0) +
    (noExamOnly ? 1 : 0) +
    (maxTuition != null ? 1 : 0) +
    (maxDtm != null ? 1 : 0) +
    (deadlineWithin != null ? 1 : 0);

  const clearAll = () => {
    setCity("");
    setLangs([]);
    setParts([]);
    setGrantOnly(false);
    setNoExamOnly(false);
    setMaxTuition(null);
    setMaxDtm(null);
    setDeadlineWithin(null);
  };

  const toggle = <T,>(setter: (fn: (p: T[]) => T[]) => void, v: T) =>
    setter((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  if (loading || !user) return null;

  const submittedCount = user.applications.filter(
    (a) => a.status !== "YUBORILMAGAN",
  ).length;
  const draftCount = user.applications.filter(
    (a) => a.status === "YUBORILMAGAN",
  ).length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
      {/* ─── Slim top header ─── */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6 pb-5 border-b border-hairline">
        <div>
          <h1 className="text-[22px] font-semibold text-ink">
            Salom, {user.fullName.split(" ")[0]}
          </h1>
          <p className="text-[13.5px] text-muted mt-0.5">
            Sizga mos universitetni toping va arizangizni boshlang.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[13px]">
          {user.applications.length > 0 && (
            <>
              <Stat label="Yuborilmagan" value={draftCount} />
              <span className="w-px h-8 bg-hairline" />
              <Stat label="Yuborilgan" value={submittedCount} />
              <span className="w-px h-8 bg-hairline ml-2" />
            </>
          )}
          <Link
            href="/profil#ota-ona"
            className="inline-flex h-9 items-center gap-1.5 px-3.5 rounded-md border border-hairline text-ink text-[13px] font-medium hover:border-ink transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Ota-onangizni ulang
          </Link>
          {user.applications.length > 0 && (
            <Link
              href="/arizalar"
              className="inline-flex h-9 items-center px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary-active transition-colors"
            >
              Arizalarim →
            </Link>
          )}
        </div>
      </div>

      {/* ─── Two-pane ─── */}
      <div
        className={`grid grid-cols-1 gap-6 ${
          filtersOpen ? "lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]" : ""
        }`}
      >
        {/* ── LEFT RAIL ── */}
        {filtersOpen && (
          <aside className="lg:sticky lg:top-[92px] lg:self-start lg:max-h-[calc(100vh-110px)] lg:overflow-y-auto lg:pr-1">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-hairline">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-ink tracking-tight">
                  Filtrlar
                </h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-md text-muted hover:text-ink hover:bg-surface-soft transition-colors"
                  title="Filtrlarni yashirish"
                  aria-label="Filtrlarni yashirish"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:text-primary-active transition-colors"
                >
                  Tozalash
                  <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-primary/12 text-primary text-[10px] font-semibold">
                    {activeFilterCount}
                  </span>
                </button>
              )}
            </div>

          <FilterGroup
            label="Til"
            isActive={langs.length > 0}
            onClear={() => setLangs([])}
          >
            {LANGUAGES.map((l) => (
              <Chip
                key={l}
                active={langs.includes(l)}
                onClick={() => toggle<Lang>(setLangs, l)}
              >
                {l}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup
            label="Ta'lim shakli"
            isActive={parts.length > 0}
            onClear={() => setParts([])}
          >
            {PARTS.map((p) => (
              <Chip
                key={p.v}
                active={parts.includes(p.v)}
                onClick={() => toggle<Part>(setParts, p.v)}
              >
                {p.l}
              </Chip>
            ))}
          </FilterGroup>

          {cities.length > 1 && (
            <FilterGroup
              label="Shahar"
              isActive={city !== ""}
              onClear={() => setCity("")}
            >
              {cities.map((c) => (
                <Chip
                  key={c}
                  active={city === c}
                  onClick={() => setCity(city === c ? "" : c)}
                >
                  {c}
                </Chip>
              ))}
            </FilterGroup>
          )}

          <FilterGroup
            label="Yaqin muddat"
            isActive={deadlineWithin != null}
            onClear={() => setDeadlineWithin(null)}
          >
            {[
              { d: 7, l: "Bu hafta" },
              { d: 14, l: "2 hafta" },
              { d: 30, l: "1 oy" },
              { d: 90, l: "3 oy" },
            ].map((o) => (
              <Chip
                key={o.d}
                active={deadlineWithin === o.d}
                onClick={() => setDeadlineWithin(deadlineWithin === o.d ? null : o.d)}
              >
                {o.l}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Yillik kontrakt (ko'pi bilan)">
            <TuitionSlider value={maxTuition} onChange={setMaxTuition} />
          </FilterGroup>

          <FilterGroup
            label="Mening DTM ballim"
            isActive={maxDtm != null}
            onClear={() => setMaxDtm(null)}
          >
            {[120, 150, 170, 189].map((b) => (
              <Chip
                key={b}
                active={maxDtm === b}
                onClick={() => setMaxDtm(maxDtm === b ? null : b)}
              >
                {b}+ ball
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Boshqa">
            <Chip active={grantOnly} onClick={() => setGrantOnly((v) => !v)}>
              Grant mavjud
            </Chip>
            <Chip active={noExamOnly} onClick={() => setNoExamOnly((v) => !v)}>
              Ichki imtihonsiz
            </Chip>
          </FilterGroup>

          </aside>
        )}

        {/* ── MAIN ── */}
        <main>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-5">
            {!filtersOpen && (
              <button
                onClick={() => setFiltersOpen(true)}
                className={`h-10 inline-flex items-center gap-2 px-3.5 rounded-lg border text-[13px] font-medium transition-all ${
                  activeFilterCount > 0
                    ? "bg-primary/8 text-primary border-primary/30 hover:bg-primary/12"
                    : "bg-canvas text-ink border-hairline hover:border-ink"
                }`}
                title="Filtrlarni ko'rsatish"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Filtrlar
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10.5px] font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
            <div className="flex-1 relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Universitet yoki shahar bo'yicha qidiring..."
                className="w-full h-10 pl-10 pr-4 border border-hairline rounded-lg text-[14px] focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-10 pl-3.5 pr-9 border border-hairline rounded-lg text-[13px] font-medium text-ink bg-canvas hover:border-ink transition-colors appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-0.5 h-10 p-0.5 border border-hairline rounded-lg bg-canvas">
                <ViewBtn active={view === "grid"} onClick={() => setView("grid")} title="Karta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </ViewBtn>
                <ViewBtn active={view === "list"} onClick={() => setView("list")} title="Ro'yxat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </ViewBtn>
              </div>
            </div>
          </div>

          {/* Result count */}
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[14px] font-medium text-muted">
              {filtered.length} ta universitet topildi
            </h2>
          </div>

          {loadingUnis ? (
            <div className="text-center py-16 text-muted">Yuklanmoqda...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border border-hairline rounded-lg bg-surface-soft">
              <div className="text-[15px] text-ink font-medium mb-1">
                Hech qanday universitet topilmadi
              </div>
              <div className="text-[13px] text-muted mb-4">
                Filtrlarni o&apos;zgartirib ko&apos;ring.
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="inline-flex h-9 items-center px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary-active transition-colors"
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((u) => (
                <UniversityCard key={u.id} uni={u} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((u) => (
                <UniversityRow key={u.id} uni={u} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Sidebar building blocks ───

function FilterGroup({
  label,
  children,
  isActive,
  onClear,
}: {
  label: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClear?: () => void;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-medium text-muted">{label}</div>
        {isActive && onClear && (
          <button
            onClick={onClear}
            className="text-[11px] text-primary/70 hover:text-primary transition-colors"
            type="button"
          >
            tozalash
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

// ─── Tuition slider with editable number input ───
const TUITION_MIN = 5;   // 5M so'm
const TUITION_MAX = 80;  // 80M so'm

function TuitionSlider({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  // Store the slider's current position in millions. If value is null,
  // we treat it as the max (no limit applied yet).
  const sliderVal = value == null ? TUITION_MAX : Math.round(value / 1_000_000);
  const isActive = value != null;

  const handleSliderChange = (v: number) => {
    if (v >= TUITION_MAX) onChange(null);
    else onChange(v * 1_000_000);
  };

  const handleInputChange = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return onChange(null);
    const n = Number(trimmed);
    if (Number.isNaN(n)) return;
    if (n >= TUITION_MAX) return onChange(null);
    onChange(Math.max(TUITION_MIN, n) * 1_000_000);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <div
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[12px] font-medium transition-colors ${
            isActive
              ? "bg-primary/8 text-primary border-primary/30"
              : "bg-canvas text-muted border-hairline/70"
          }`}
        >
          <span>≤</span>
          <input
            type="number"
            inputMode="numeric"
            min={TUITION_MIN}
            max={TUITION_MAX}
            value={isActive ? sliderVal : ""}
            placeholder={String(TUITION_MAX)}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-8 bg-transparent text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span>mln</span>
        </div>
        {isActive && (
          <button
            onClick={() => onChange(null)}
            className="text-[11px] text-primary/70 hover:text-primary transition-colors"
            type="button"
          >
            tozalash
          </button>
        )}
      </div>
      <input
        type="range"
        min={TUITION_MIN}
        max={TUITION_MAX}
        step={1}
        value={sliderVal}
        onChange={(e) => handleSliderChange(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer"
        style={{ height: 4 }}
      />
      <div className="flex justify-between text-[10.5px] text-muted mt-1">
        <span>{TUITION_MIN}M</span>
        <span>{TUITION_MAX}M+</span>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-2.5 text-[12px] font-medium rounded-md border transition-all duration-150 ${
        active
          ? "bg-primary/8 text-primary border-primary/30 hover:bg-primary/12"
          : "bg-canvas text-body border-hairline/70 hover:border-ink/40 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}


function ViewBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-full w-9 inline-flex items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-ink text-white"
          : "text-muted hover:text-ink hover:bg-surface-soft"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-[18px] font-bold text-ink">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}
