import Link from "next/link";
import { University } from "@/lib/types";
import { formatDate, formatSom } from "@/lib/format";
import { UniLogo } from "@/components/UniLogo";

// Soft tint palette. Each card gets a stable color picked from the slug.
const TINTS = [
  { bg: "#fdf2f4", ring: "#f5d4d9", accent: "#8b1a2e" }, // primary
  { bg: "#f0f4ee", ring: "#cfdcc7", accent: "#3d6b34" }, // green
  { bg: "#f0f1f7", ring: "#cdd2e6", accent: "#3b4391" }, // indigo
  { bg: "#fbf4eb", ring: "#ecd9be", accent: "#8a5a14" }, // amber
  { bg: "#eaf3f5", ring: "#c8e0e4", accent: "#1d5d6b" }, // teal
  { bg: "#f4eef7", ring: "#dec9e8", accent: "#5b3782" }, // violet
];

function tintFor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

// Days remaining → urgency badge color.
function deadlineBadge(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "Muddat o'tdi", tone: "stale" as const };
  if (days <= 14) return { label: `${days} kun qoldi`, tone: "urgent" as const };
  if (days <= 45) return { label: `${days} kun qoldi`, tone: "soon" as const };
  return { label: `${days} kun qoldi`, tone: "fresh" as const };
}

const TONE_STYLES = {
  urgent: "bg-[#fdecec] text-[#a4232b] border-[#f4c7c9]",
  soon: "bg-[#fbf4eb] text-[#8a5a14] border-[#ecd9be]",
  fresh: "bg-[#eef5ef] text-[#3d6b34] border-[#cfdcc7]",
  stale: "bg-surface-soft text-muted border-hairline",
};

export function UniversityCard({ uni }: { uni: University }) {
  const tint = tintFor(uni.slug);
  const badge = deadlineBadge(uni.deadline);

  return (
    <Link
      href={`/universitetlar/${uni.slug}`}
      className="group block rounded-lg overflow-hidden border border-hairline bg-canvas transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card"
      style={{
        // Custom property used by the hover border + accent text.
        ["--card-accent" as never]: tint.accent,
      }}
    >
      <div
        className="aspect-[4/3] relative overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${tint.bg} 0%, ${tint.ring} 100%)`,
        }}
      >
        <UniLogo
          logo={uni.logo}
          alt={uni.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          textClassName="text-7xl font-bold text-ink/15"
        />

        {/* Subtle dark gradient at bottom on hover for label legibility */}
        <div
          className="absolute inset-x-0 bottom-0 h-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 100%)",
          }}
        />

        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-card backdrop-blur"
          style={{
            background: "rgba(255,255,255,0.92)",
            color: tint.accent,
          }}
        >
          {uni.shortName}
        </span>

        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10.5px] font-mono uppercase tracking-wide border backdrop-blur ${TONE_STYLES[badge.tone]}`}
          style={{ background: "rgba(255,255,255,0.85)" }}
        >
          {badge.label}
        </span>
      </div>

      <div className="p-4">
        <h3
          className="text-[16px] font-semibold text-ink leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-[color:var(--card-accent)]"
        >
          {uni.name}
        </h3>
        <p className="text-[13.5px] text-muted mt-1">{uni.city}</p>

        <div className="mt-3 pt-3 border-t border-hairline-soft flex items-baseline justify-between gap-2">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-wide text-muted">
              Ohirgi muddat
            </div>
            <div className="text-[13.5px] text-ink font-medium">
              {formatDate(uni.deadline)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[15px] font-semibold text-ink">
              {formatSom(uni.tuitionMin)}
            </div>
            <div className="text-[11px] text-muted">/ yil</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
