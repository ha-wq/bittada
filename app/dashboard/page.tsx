"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, apiJson } from "@/lib/auth-context";
import { University } from "@/lib/types";
import { UniversityCard } from "@/components/UniversityCard";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "english" | "grant">("all");
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  useEffect(() => {
    apiJson<University[]>("/api/universities")
      .then(setUniversities)
      .finally(() => setLoadingUnis(false));
  }, []);

  const filtered = useMemo(() => {
    return universities.filter((u) => {
      if (
        query &&
        !u.name.toLowerCase().includes(query.toLowerCase()) &&
        !u.shortName.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (filter === "english" && !u.language.includes("Ingliz")) return false;
      if (filter === "grant" && !u.offersFinancialAid) return false;
      return true;
    });
  }, [query, filter, universities]);

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

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Universitet nomi bo'yicha qidiring..."
            className="w-full h-12 pl-12 pr-4 border border-hairline rounded-full text-[15px] focus:outline-none focus:border-ink"
          />
        </div>
        <div className="flex gap-2">
          {[
            { v: "all" as const, l: "Hammasi" },
            { v: "english" as const, l: "Ingliz tilida" },
            { v: "grant" as const, l: "Grant mavjud" },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`h-12 px-5 rounded-full text-[14px] font-medium border transition-colors ${
                filter === f.v
                  ? "bg-ink text-white border-ink"
                  : "bg-canvas text-ink border-hairline hover:border-ink"
              }`}
            >
              {f.l}
            </button>
          ))}
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
