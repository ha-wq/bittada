"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isProfileComplete, useAuth } from "@/lib/auth-context";
import { ScoutingCard } from "@/components/ScoutingCard";

export default function SkautingPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const profileReady = isProfileComplete(user.profile);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-10">
      <div className="mb-8">
        <div className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase mb-2">
          Skauting
        </div>
        <h1 className="text-[28px] font-bold text-ink leading-tight">
          Avtomatik ariza topshirish.
        </h1>
        <p className="text-[15px] text-muted mt-2 max-w-[60ch]">
          Skauting profilingiz bilan mos universitetlarni avtomatik tanlab,
          ariza yuborib turadi. Hujjatlar va imtihon natijalari profilingizdan
          olinadi.
        </p>
      </div>

      {!profileReady && (
        <div className="mb-6 p-5 rounded-md border border-hairline bg-surface-soft flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[14px] font-semibold text-ink">
              Avval profilingizni to&apos;ldiring
            </div>
            <div className="text-[13px] text-muted mt-0.5">
              Skautingni yoqishdan oldin pasport, diplom va imtihon ballarini
              kiriting.
            </div>
          </div>
          <Link
            href="/profil"
            className="inline-flex h-10 items-center px-5 rounded-md bg-primary text-white text-[14px] font-medium hover:bg-primary-active transition-colors"
          >
            Profilga o&apos;tish →
          </Link>
        </div>
      )}

      <ScoutingCard
        profile={user.profile}
        complete={profileReady}
        onChanged={refresh}
      />
    </div>
  );
}
