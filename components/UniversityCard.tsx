import Link from "next/link";
import { University } from "@/lib/types";
import { formatDate, formatSom } from "@/lib/format";
import { UniLogo } from "@/components/UniLogo";

// Brand red — the only accent color, matching the rest of the app.
const BRAND_RED = "#8b1a2e";

function deadlineMeta(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "Muddat o'tdi", tone: "stale" as const, days };
  if (days <= 14) return { label: `${days} kun qoldi`, tone: "urgent" as const, days };
  if (days <= 45) return { label: `${days} kun qoldi`, tone: "soon" as const, days };
  return { label: `${days} kun qoldi`, tone: "fresh" as const, days };
}

const TONE_DOT = {
  urgent: "bg-primary",
  soon: "bg-[#b07a1a]",
  fresh: "bg-[#3d6b34]",
  stale: "bg-muted-soft",
};

const TONE_TEXT = {
  urgent: "text-primary",
  soon: "text-[#8a5a14]",
  fresh: "text-[#3d6b34]",
  stale: "text-muted",
};

// ─── GRID CARD ───
export function UniversityCard({ uni }: { uni: University }) {
  const meta = deadlineMeta(uni.deadline);

  return (
    <Link
      href={`/universitetlar/${uni.slug}`}
      className="group block rounded-xl overflow-hidden border border-hairline bg-canvas transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-card hover:border-primary/40"
    >
      <div
        className="aspect-[16/10] relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #f4f1ec 0%, #ebe7df 100%)",
        }}
      >
        <UniLogo
          logo={uni.logo}
          alt={uni.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          textClassName="text-7xl font-bold text-ink/15"
        />

        {/* Brand-red badge */}
        <span
          className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10.5px] font-semibold text-white shadow-sm"
          style={{ background: BRAND_RED }}
        >
          {uni.shortName}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-[15.5px] font-semibold text-ink leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-primary">
          {uni.name}
        </h3>
        <p className="text-[13px] text-muted mt-0.5">{uni.city}</p>

        {/* Single-line meta: date + days remaining */}
        <div className="mt-2.5 flex items-center gap-2 text-[12.5px]">
          <span className={`w-1.5 h-1.5 rounded-full ${TONE_DOT[meta.tone]}`} />
          <span className="text-ink/75">{formatDate(uni.deadline)}</span>
          <span className="text-ink/30">·</span>
          <span className={`font-medium ${TONE_TEXT[meta.tone]}`}>
            {meta.label}
          </span>
        </div>

        <div className="mt-3.5 pt-3 border-t border-hairline-soft flex items-baseline justify-between">
          <div className="text-[15px] font-semibold text-ink">
            {formatSom(uni.tuitionMin)}
            <span className="text-[12px] font-normal text-muted ml-1">/ yil</span>
          </div>
          <span className="text-[12px] text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary">
            Batafsil →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── LIST CARD (horizontal, dense) ───
export function UniversityRow({ uni }: { uni: University }) {
  const meta = deadlineMeta(uni.deadline);

  return (
    <Link
      href={`/universitetlar/${uni.slug}`}
      className="group flex items-center gap-4 p-3 rounded-lg border border-hairline bg-canvas hover:border-primary/40 hover:shadow-card transition-all duration-200"
    >
      <div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden shrink-0"
        style={{
          background: "linear-gradient(135deg, #f4f1ec 0%, #ebe7df 100%)",
        }}
      >
        <UniLogo
          logo={uni.logo}
          alt={uni.name}
          className="absolute inset-0 w-full h-full object-cover"
          textClassName="text-3xl font-bold text-ink/20"
        />
        <span
          className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9.5px] font-semibold text-white"
          style={{ background: BRAND_RED }}
        >
          {uni.shortName}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-muted">{uni.city}</div>
        <h3 className="text-[15px] font-semibold text-ink leading-snug line-clamp-1 mt-0.5 transition-colors group-hover:text-primary">
          {uni.name}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
          <span className="text-ink/70">{formatDate(uni.deadline)}</span>
          <span className={`inline-flex items-center gap-1 ${TONE_TEXT[meta.tone]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${TONE_DOT[meta.tone]}`} />
            {meta.label}
          </span>
          {uni.language.slice(0, 2).map((l) => (
            <span key={l}>{l} tilida</span>
          ))}
          {uni.offersFinancialAid && (
            <span className="text-[#3d6b34]">Grant</span>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-[15px] font-semibold text-ink">
          {formatSom(uni.tuitionMin)}
        </div>
        <div className="text-[11px] text-muted">/ yil</div>
      </div>
    </Link>
  );
}
