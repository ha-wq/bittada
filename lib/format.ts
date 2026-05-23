const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

const pad2 = (n: number) => n.toString().padStart(2, "0");

// Deterministic thousands grouping — same output on server and client.
export const formatSom = (amount: number) => {
  const s = Math.trunc(Math.abs(amount)).toString();
  let out = "";
  for (let i = s.length; i > 0; i -= 3) {
    out = s.slice(Math.max(0, i - 3), i) + (out ? " " + out : "");
  }
  return (amount < 0 ? "-" : "") + out + " so'm";
};

// Date-only formatter. Uses UTC components so server and client render identically.
export const formatDate = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${d.getUTCDate()} ${UZ_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

export const formatDateTime = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${d.getUTCDate()} ${UZ_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};

export const PART_OF_DAY_LABEL: Record<string, string> = {
  kunduzgi: "Kunduzgi",
  kechki: "Kechki",
  sirtqi: "Sirtqi",
};

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  YUBORILMAGAN: "Yuborilmagan",
  KORIB_CHIQILMOQDA: "Ko'rib chiqilmoqda",
  QABUL_QILINDI: "Qabul qilindi",
  RAD_ETILDI: "Rad etildi",
};
