export const formatSom = (amount: number) =>
  new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";

export const formatDate = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatDateTime = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
