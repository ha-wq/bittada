"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/lib/auth-context";

type ParentRequest = {
  id: string;
  status: "PENDING" | "APPROVED";
  parent: { id: string; fullName: string; email: string | null };
};

export function ClaimCodeCard() {
  const [code, setCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [requests, setRequests] = useState<ParentRequest[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const loadRequests = () =>
    apiJson<ParentRequest[]>("/api/parent-requests")
      .then(setRequests)
      .catch(() => {});

  useEffect(() => {
    apiJson<{ code: string | null }>("/api/claim-code")
      .then((d) => setCode(d.code))
      .catch(() => {});
    loadRequests();
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const d = await apiJson<{ code: string }>("/api/claim-code", {
        method: "POST",
      });
      setCode(d.code);
    } finally {
      setGenerating(false);
    }
  };

  const decide = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    try {
      await apiJson(`/api/parent-requests/${id}`, { body: { action } });
      await loadRequests();
    } finally {
      setBusy(null);
    }
  };

  const pending = requests.filter((r) => r.status === "PENDING");
  const approved = requests.filter((r) => r.status === "APPROVED");

  return (
    <div className="border border-hairline rounded-md p-5">
      <h2 className="text-[16px] font-semibold text-ink">Ota-ona ulanishi</h2>
      <p className="text-[13px] text-muted mt-1">
        Ota-onangiz siz uchun ariza topshira olishi uchun ushbu kodni unga
        bering. Ular kodni kiritgach, so'rovni tasdiqlaysiz.
      </p>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <div className="font-mono text-[22px] tracking-[0.3em] bg-surface-soft border border-hairline rounded-md px-4 py-2 text-ink">
          {code || "— — — — — —"}
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="h-10 px-4 rounded-md border border-hairline text-[14px] font-medium text-ink hover:border-ink"
        >
          {generating ? "..." : code ? "Yangi kod" : "Kod yaratish"}
        </button>
      </div>
      {code && (
        <p className="text-[12px] text-muted mt-1.5">Kod 24 soat amal qiladi.</p>
      )}

      {pending.length > 0 && (
        <div className="mt-4">
          <div className="text-[13px] font-semibold text-warning mb-2">
            Tasdiqlash kutilmoqda
          </div>
          <div className="space-y-2">
            {pending.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 border border-warning/30 bg-warning/5 rounded-md p-3"
              >
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-ink truncate">
                    {r.parent.fullName}
                  </div>
                  <div className="text-[12px] text-muted truncate">
                    {r.parent.email}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => decide(r.id, "approve")}
                    disabled={busy === r.id}
                    className="h-9 px-3 rounded-md bg-primary text-white text-[13px] font-medium"
                  >
                    Tasdiqlash
                  </button>
                  <button
                    onClick={() => decide(r.id, "reject")}
                    disabled={busy === r.id}
                    className="h-9 px-3 rounded-md border border-hairline text-[13px] font-medium text-ink"
                  >
                    Rad etish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div className="mt-4">
          <div className="text-[13px] font-semibold text-ink mb-2">
            Bog'langan ota-onalar
          </div>
          <div className="space-y-1.5">
            {approved.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 text-[14px] text-ink"
              >
                <span className="w-2 h-2 rounded-full bg-success" />
                {r.parent.fullName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
