"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, apiJson } from "@/lib/auth-context";
import { University } from "@/lib/types";
import { UniversityCard } from "@/components/UniversityCard";

const LANGUAGES = ["O'zbek", "Rus", "Ingliz"] as const;
type Lang = (typeof LANGUAGES)[number];

type SortKey = "deadline" | "price-asc" | "price-desc" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "deadline", label: "Muddat yaqinligi" },
  { value: "price-asc", label: "Narx — arzondan" },
  { value: "price-desc", label: "Narx — qimmatdan" },
  { value: "name", label: "Nomi (A–Z)" },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);

  // Filter state
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>("");
  const [langs, setLangs] = useState<Lang[]>([]);
  const [grantOnly, setGrantOnly] = useState(false);
  const [noExamOnly, setNoExamOnly] = useState(false);
  const [maxTuition, setMaxTuition] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("deadline");
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  useEffect(() => {
    apiJson<University[]>("/api/universities")
      .then(setUniversities)
      .finally(() => setLoadingUnis(false));
  }, []);

  // Cities derived from the loaded data
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
      if (grantOnly && !u.offersFinancialAid) return false;
      if (noExamOnly && u.hasEntranceExam) return false;
      if (maxTuition != null && u.tuitionMin > maxTuition) return false;
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
  }, [query, city, langs, grantOnly, noExamOnly, maxTuition, sort, universities]);

  const activeFilterCount =
    (city ? 1 : 0) +
    langs.length +
    (grantOnly ? 1 : 0) +
    (noExamOnly ? 1 : 0) +
    (maxTuition != null ? 1 : 0);

  const clearAll = () => {
    setCity("");
    setLangs([]);
    setGrantOnly(false);
    setNoExamOnly(false);
    setMaxTuition(null);
  };

  const toggleLang = (l: Lang) =>
    setLangs((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l],
    );

  if (loading || !user) return null;

  const submittedCount = user.applications.filter(
    (a) => a.status !== "YUBORILMAGAN",
  ).length;
  const draftCount = user.applications.filter(
    (a) => a.status === "YUBORILMAGAN",
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-[28px] font-bold text-ink">
          Salom, {user.fullName.split(" ")[0]} 👋
        </h1>
        <p className="text-[15px] text-muted">
          Sizga mos universitetni toping va arizangizni boshlang.
        </p>
      </div>

      {user.applications.length > 0 && (
        <div className="bg-surface-soft rounded-md p-5 mb-8 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[24px] font-bold text-ink">{draftCount}</div>
              <div className="text-[13px] text-muted">Yuborilmagan</div>
            </div>
            <div className="h-10 w-px bg-hairline" />
            <div>
              <div className="text-[24px] font-bold text-ink">{submittedCount}</div>
              <div className="text-[13px] text-muted">Yuborilgan</div>
            </div>
          </div>
          <Link
            href="/arizalar"
            className="inline-flex h-10 items-center px-5 rounded-md bg-ink text-white text-[14px] font-medium hover:opacity-90"
          >
            Mening arizalarim →
          </Link>
        </div>
      )}

      {/* ─── FILTER PANEL ─── */}
      <div className="mb-6">
        {/* Top row: search + sort + more */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Universitet nomi yoki shahar bo'yicha qidiring..."
              className="w-full h-12 pl-12 pr-4 border border-hairline rounded-full text-[15px] focus:outline-none focus:border-ink transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-12 pl-4 pr-10 border border-hairline rounded-full text-[14px] font-medium text-ink bg-canvas hover:border-ink transition-colors appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Saralash: {o.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`h-12 px-5 inline-flex items-center gap-2 rounded-full text-[14px] font-medium border transition-all ${
                moreOpen || activeFilterCount > 0
                  ? "bg-ink text-white border-ink"
                  : "bg-canvas text-ink border-hairline hover:border-ink"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Filtrlar
              {activeFilterCount > 0 && (
                <span
                  className={`ml-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                    moreOpen || activeFilterCount > 0
                      ? "bg-white text-ink"
                      : "bg-ink text-white"
                  }`}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick chips: always visible */}
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={grantOnly} onClick={() => setGrantOnly((v) => !v)}>
            Grant mavjud
          </FilterChip>
          <FilterChip active={noExamOnly} onClick={() => setNoExamOnly((v) => !v)}>
            Imtihonsiz
          </FilterChip>
          {LANGUAGES.map((l) => (
            <FilterChip
              key={l}
              active={langs.includes(l)}
              onClick={() => toggleLang(l)}
            >
              {l} tilida
            </FilterChip>
          ))}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="h-9 px-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink transition-colors"
            >
              Tozalash
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Expanded panel: city + tuition */}
        <div
          className="grid transition-all duration-300 ease-out overflow-hidden"
          style={{ gridTemplateRows: moreOpen ? "1fr" : "0fr" }}
        >
          <div className="min-h-0">
            <div className="mt-4 p-5 rounded-lg border border-hairline bg-surface-soft">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-2">
                    Shahar
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={city === ""} onClick={() => setCity("")}>
                      Hammasi
                    </FilterChip>
                    {cities.map((c) => (
                      <FilterChip
                        key={c}
                        active={city === c}
                        onClick={() => setCity(city === c ? "" : c)}
                      >
                        {c}
                      </FilterChip>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-2">
                    Yillik narx (ko&apos;pi bilan)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      active={maxTuition == null}
                      onClick={() => setMaxTuition(null)}
                    >
                      Cheklovsiz
                    </FilterChip>
                    {[15_000_000, 25_000_000, 35_000_000, 50_000_000].map((t) => (
                      <FilterChip
                        key={t}
                        active={maxTuition === t}
                        onClick={() => setMaxTuition(maxTuition === t ? null : t)}
                      >
                        ≤ {(t / 1_000_000).toFixed(0)}M so&apos;m
                      </FilterChip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-[18px] font-semibold text-ink mb-4">
        Universitetlar ({filtered.length})
      </h2>

      {loadingUnis ? (
        <div className="text-center py-16 text-muted">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((u) => (
              <UniversityCard key={u.id} uni={u} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted">
              Hech qanday universitet topilmadi.
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="block mx-auto mt-3 text-ink underline hover:no-underline"
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({
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
      className={`h-9 px-3.5 inline-flex items-center gap-1.5 rounded-full text-[13px] font-medium border transition-all duration-200 ${
        active
          ? "bg-ink text-white border-ink shadow-sm"
          : "bg-canvas text-body border-hairline hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
