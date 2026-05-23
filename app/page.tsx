"use client";

import Link from "next/link";
import { useAuth, apiJson } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { University } from "@/lib/types";

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

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 sm:px-8 pt-16 pb-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-ink leading-[1.1] tracking-tight">
            O'zbekistondagi xususiy universitetlarga
            <br />
            <span className="text-primary">bitta joydan</span> ariza topshiring.
          </h1>
          <p className="text-[18px] text-body mt-6 max-w-2xl leading-relaxed">
            Bittada — Westminster, Inha, Ajou, MDIS va boshqa o'nlab
            universitetlarga bir martalik profil bilan ariza yuborish imkonini
            beradi. Vaqtni tejang, hujjatlarni bir marta to'ldiring.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/royxat"
              className="inline-flex h-12 items-center px-7 rounded-md bg-primary text-white text-[15px] font-medium hover:bg-primary-active transition-colors"
            >
              Bepul boshlash
            </Link>
            <Link
              href="/kirish"
              className="inline-flex h-12 items-center px-7 rounded-md border border-ink text-ink text-[15px] font-medium hover:bg-surface-soft transition-colors"
            >
              Hisobga kirish
            </Link>
          </div>
        </div>
      </section>

      {unis.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-8 pb-24">
          <h2 className="text-[22px] font-semibold text-ink mb-6">
            Platformada {unis.length}+ universitet
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {unis.map((u) => (
              <div
                key={u.id}
                className="aspect-square rounded-md bg-surface-soft flex items-center justify-center flex-col p-3 text-center"
              >
                <span className="text-3xl font-bold text-ink/20">{u.logo}</span>
                <span className="text-[12px] font-medium text-muted mt-1 line-clamp-2">
                  {u.shortName}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-surface-soft py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <h2 className="text-[28px] font-bold text-ink">Qanday ishlaydi</h2>
          <div className="grid sm:grid-cols-3 gap-8 mt-10">
            {[
              {
                n: "1",
                t: "Profil yarating",
                d: "Bir marta hujjatlaringizni, test natijalaringizni va shaxsiy ma'lumotlaringizni kiriting.",
              },
              {
                n: "2",
                t: "Universitetlarni tanlang",
                d: "Sizga mos bo'lgan barcha universitetlarni ko'rib chiqing va ro'yxatga qo'shing.",
              },
              {
                n: "3",
                t: "Bir tugma bilan yuboring",
                d: "Tanlangan barcha universitetlarga arizalaringiz birdaniga yuboriladi.",
              },
            ].map((s) => (
              <div key={s.n}>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold">
                  {s.n}
                </div>
                <h3 className="text-[18px] font-semibold text-ink mt-4">{s.t}</h3>
                <p className="text-[15px] text-body mt-2 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 text-[14px] text-muted">
          © 2026 Bittada. O'zbekiston xususiy universitetlari uchun yagona
          platforma.
        </div>
      </footer>
    </div>
  );
}
