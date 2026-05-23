import Link from "next/link";
import { University } from "@/lib/types";
import { formatDate, formatSom } from "@/lib/mock-universities";

export function UniversityCard({ uni }: { uni: University }) {
  return (
    <Link
      href={`/universitetlar/${uni.id}`}
      className="group block bg-canvas rounded-md overflow-hidden transition-all hover:shadow-card"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-surface-strong to-surface-soft rounded-md flex items-center justify-center relative overflow-hidden">
        <span className="text-7xl font-bold text-ink/15">{uni.logo}</span>
        <span className="absolute top-3 left-3 bg-canvas/95 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-ink shadow-card">
          {uni.shortName}
        </span>
      </div>
      <div className="pt-3">
        <h3 className="text-[16px] font-semibold text-ink leading-tight line-clamp-2 group-hover:underline">
          {uni.name}
        </h3>
        <p className="text-[14px] text-muted mt-1">{uni.city}</p>
        <p className="text-[14px] text-muted">
          Muddat: {formatDate(uni.deadline)}
        </p>
        <p className="text-[14px] text-ink mt-1">
          <span className="font-semibold">{formatSom(uni.tuitionMin)}</span>
          <span className="text-muted"> / yil</span>
        </p>
      </div>
    </Link>
  );
}
