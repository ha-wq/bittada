import "server-only";
import type { Profile, University, Major } from "@prisma/client";

// Gemini "free tier" REST endpoint. No SDK — just fetch.
// Get a key at https://aistudio.google.com/apikey and set GEMINI_API_KEY.
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";

function apiKey() {
  const k = process.env.GEMINI_API_KEY;
  if (!k) {
    throw new Error(
      "AI tavsiya tizimi sozlanmagan (GEMINI_API_KEY yo'q). Administrator bilan bog'laning.",
    );
  }
  return k;
}

type JsonSchema = Record<string, unknown>;

// Low-level call: send a prompt, get back parsed JSON matching `schema`.
async function generateJson<T>(
  prompt: string,
  schema: JsonSchema,
): Promise<T> {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const res = await fetch(`${BASE}/${model}:generateContent?key=${apiKey()}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Gemini error:", res.status, detail);
    throw new Error("AI xizmatida xatolik yuz berdi. Birozdan so'ng urinib ko'ring.");
  }

  const data = await res.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("AI javob qaytarmadi. Qayta urinib ko'ring.");

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("Gemini returned non-JSON:", text);
    throw new Error("AI javobini o'qib bo'lmadi. Qayta urinib ko'ring.");
  }
}

// ─── Profile → readable summary ─────────────────────────────────

type ScoreJson = Record<string, unknown> | null;

function fmtScores(profile: Profile): string {
  const lines: string[] = [];
  const ielts = profile.ielts as ScoreJson;
  if (ielts?.overall) lines.push(`IELTS: ${ielts.overall}`);
  const sat = profile.sat as ScoreJson;
  if (sat?.total) lines.push(`SAT: ${sat.total}`);
  const dtm = profile.dtm as ScoreJson;
  if (dtm?.total) lines.push(`DTM: ${dtm.total}`);
  const milliy = profile.milliySertifikat as { subjects?: unknown[] } | null;
  if (milliy?.subjects?.length) {
    lines.push(`Milliy sertifikat: ${milliy.subjects.length} ta fan`);
  }
  return lines.length ? lines.join(", ") : "test natijalari kiritilmagan";
}

function profileSummary(profile: Profile): string {
  return [
    `Maktab/o'quv yurti: ${profile.school || "noma'lum"}`,
    `Davlat: ${profile.country || "noma'lum"}`,
    `Fuqarolik: ${profile.citizenship || "noma'lum"}`,
    `Bitirish yili: ${profile.graduationYear || "noma'lum"}`,
    `Test natijalari: ${fmtScores(profile)}`,
    `Grantga ariza topshirmoqchi: ${profile.applyingForGrant ? "ha" : "yo'q"}`,
  ].join("\n");
}

// ─── Questions ──────────────────────────────────────────────────

export type RecommendationQuestion = {
  id: string;
  question: string;
  options: string[];
};

const QUESTIONS_SCHEMA: JsonSchema = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          question: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["id", "question", "options"],
      },
    },
  },
  required: ["questions"],
};

export async function generateQuestions(
  profile: Profile,
): Promise<RecommendationQuestion[]> {
  const prompt = `Sen O'zbekistondagi abituriyentlarga universitet tanlashda yordam beradigan maslahatchisan.

Quyida talabaning profili keltirilgan:
${profileSummary(profile)}

Vazifa: talabaga mos universitetni tanlashga yordam berish uchun 4 ta ko'p tanlovli (multiple-choice) savol tuz. Savollar talabaning afzalliklarini aniqlashga qaratilgan bo'lsin: masalan, kelajakdagi soha/kasb qiziqishi, joylashuv (shahar) afzalligi, o'qish narxining muhimligi, o'qish tili, kampus hayoti yoki kirish imtihoniga tayyorligi.

Qoidalar:
- Profilda allaqachon ma'lum bo'lgan narsalarni so'rama.
- Har bir savolda 3-4 ta aniq variant bo'lsin.
- Savollar va variantlar O'ZBEK TILIDA bo'lsin.
- Har bir savolga qisqa, takrorlanmaydigan "id" ber (masalan "soha", "shahar", "narx").`;

  const out = await generateJson<{ questions: RecommendationQuestion[] }>(
    prompt,
    QUESTIONS_SCHEMA,
  );
  return out.questions.slice(0, 6);
}

// ─── Ranking ────────────────────────────────────────────────────

export type RecommendationAnswer = { question: string; answer: string };

export type RankedUniversity = {
  universityId: string;
  fitScore: number;
  reason: string;
  matchedMajor: string;
};

const RANK_SCHEMA: JsonSchema = {
  type: "OBJECT",
  properties: {
    rankings: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          universityId: { type: "STRING" },
          fitScore: { type: "INTEGER" },
          reason: { type: "STRING" },
          matchedMajor: { type: "STRING" },
        },
        required: ["universityId", "fitScore", "reason"],
      },
    },
  },
  required: ["rankings"],
};

type UniWithMajors = University & { majors: Major[] };

function uniSummary(u: UniWithMajors): string {
  const majors = u.majors.map((m) => m.name).join(", ") || "—";
  const reqs: string[] = [];
  if (u.minIelts) reqs.push(`min IELTS ${u.minIelts}`);
  if (u.minDtm) reqs.push(`min DTM ${u.minDtm}`);
  if (u.minSat) reqs.push(`min SAT ${u.minSat}`);
  return [
    `ID: ${u.id}`,
    `Nomi: ${u.name} (${u.shortName})`,
    `Shahar: ${u.city}`,
    `O'qish narxi: ${u.tuitionMin}-${u.tuitionMax} so'm`,
    `Til: ${u.language.join(", ") || "—"}`,
    `Grant/moliyaviy yordam: ${u.offersFinancialAid ? "ha" : "yo'q"}`,
    `Kirish imtihoni: ${u.hasEntranceExam ? "ha" : "yo'q"}`,
    `Talablar: ${reqs.join(", ") || "yo'q"}`,
    `Yo'nalishlar: ${majors}`,
  ].join("; ");
}

export async function rankUniversities(
  profile: Profile,
  answers: RecommendationAnswer[],
  universities: UniWithMajors[],
): Promise<RankedUniversity[]> {
  const qa = answers
    .map((a, i) => `${i + 1}. ${a.question}\n   Javob: ${a.answer}`)
    .join("\n");

  const unis = universities.map(uniSummary).join("\n");

  const prompt = `Sen O'zbekistondagi abituriyentlarga universitet tanlashda yordam beradigan maslahatchisan.

TALABA PROFILI:
${profileSummary(profile)}

TALABANING JAVOBLARI:
${qa}

MAVJUD UNIVERSITETLAR:
${unis}

Vazifa: yuqoridagi universitetlarni talabaning profili va javoblariga qarab moslik darajasi bo'yicha tartibla (eng mosi birinchi). Faqat ro'yxatdagi universitetlardan foydalan.

Har bir universitet uchun:
- "universityId": ro'yxatdagi aniq ID.
- "fitScore": 0 dan 100 gacha moslik bahosi.
- "reason": nega bu universitet talabaga mos kelishi (1-2 jumla, O'ZBEK TILIDA).
- "matchedMajor": talabaga eng mos keladigan yo'nalish nomi (agar bo'lsa).

Eng mos 8 tagacha universitetni qaytar, fitScore bo'yicha kamayish tartibida.`;

  const out = await generateJson<{ rankings: RankedUniversity[] }>(
    prompt,
    RANK_SCHEMA,
  );

  const valid = new Set(universities.map((u) => u.id));
  return out.rankings
    .filter((r) => valid.has(r.universityId))
    .sort((a, b) => b.fitScore - a.fitScore);
}
