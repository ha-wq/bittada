"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/lib/auth-context";
import { formatDateTime } from "@/lib/format";
import { Button, Input } from "@/components/ui";

type ExamRow = {
  id: string;
  date: string;
  location: string;
  subjects: string[];
  capacity: number;
  price: number;
  _count: { registrations: number };
};

const EMPTY = {
  date: "",
  location: "",
  subjects: "",
  capacity: 30,
  price: 0,
};

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    apiJson<ExamRow[]>("/api/admin/exams").then((d) => {
      setExams(d);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const startEdit = (e: ExamRow) => {
    setEditingId(e.id);
    setForm({
      date: new Date(e.date).toISOString().slice(0, 16),
      location: e.location,
      subjects: e.subjects.join(", "),
      capacity: e.capacity,
      price: e.price,
    });
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    const body = {
      date: form.date,
      location: form.location,
      subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
      capacity: Number(form.capacity),
      price: Number(form.price),
    };
    try {
      if (editingId) {
        await apiJson(`/api/admin/exams/${editingId}`, { method: "PUT", body });
      } else {
        await apiJson("/api/admin/exams", { body });
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik.");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Imtihonni o'chirishni tasdiqlaysizmi?")) return;
    await apiJson(`/api/admin/exams/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-10">
      <h1 className="text-[28px] font-bold text-ink">Ichki imtihonlar</h1>
      <p className="text-[15px] text-muted mt-2">
        Talabalar ushbu imtihonlarga yozila olishadi.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 bg-surface-soft rounded-md p-5 space-y-4"
      >
        <h2 className="text-[18px] font-semibold text-ink">
          {editingId ? "Imtihonni tahrirlash" : "Yangi imtihon"}
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Sana va vaqt"
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <Input
            label="Joy / manzil"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>

        <Input
          label="Topshiriladigan fanlar (vergul bilan ajrating)"
          value={form.subjects}
          onChange={(e) => setForm({ ...form, subjects: e.target.value })}
          placeholder="Matematika, Ingliz tili"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Sig'im (nechta talaba)"
            type="number"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            required
          />
          <Input
            label="Narx (so'm) — 0 bo'lsa bepul"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
        </div>

        {error && <p className="text-[14px] text-error">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit">
            {editingId ? "Saqlash" : "Qo'shish"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY);
              }}
            >
              Bekor qilish
            </Button>
          )}
        </div>
      </form>

      <div className="mt-10">
        <h2 className="text-[20px] font-semibold text-ink mb-4">
          Rejalashtirilgan imtihonlar ({exams.length})
        </h2>

        {loading ? (
          <div className="text-muted">Yuklanmoqda...</div>
        ) : exams.length === 0 ? (
          <div className="text-muted">Hozircha hech narsa yo'q.</div>
        ) : (
          <div className="space-y-3">
            {exams.map((e) => (
              <div key={e.id} className="border border-hairline rounded-md p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[16px] font-semibold text-ink">
                      {formatDateTime(e.date)}
                    </div>
                    <div className="text-[14px] text-muted">{e.location}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {e.subjects.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-strong text-[12px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-[13px]">
                    <div>
                      {e._count.registrations} / {e.capacity} ta yozilgan
                    </div>
                    <div className="text-muted mt-0.5">
                      {e.price > 0
                        ? `${e.price.toLocaleString("uz-UZ")} so'm`
                        : "Bepul"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => startEdit(e)}
                    className="text-[13px] font-medium underline hover:text-ink"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => remove(e.id)}
                    className="text-[13px] font-medium text-error underline"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
