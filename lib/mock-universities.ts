import { University } from "./types";

export const UNIVERSITIES: University[] = [
  {
    id: "westminster",
    name: "Westminster International University in Tashkent",
    shortName: "WIUT",
    logo: "W",
    city: "Toshkent",
    address: "Istiqbol ko'chasi 12, Toshkent",
    description:
      "Westminster Toshkentdagi xalqaro universiteti — Buyuk Britaniya diplomi, ingliz tilida ta'lim. Iqtisodiyot, biznes, IT va huquq yo'nalishlari bo'yicha bakalavr darajalarini taklif etadi.",
    tuitionMin: 38_000_000,
    tuitionMax: 52_000_000,
    deadline: "2026-07-15",
    language: ["Ingliz"],
    offersFinancialAid: true,
    hasEntranceExam: true,
    entranceExamSubjects: ["Ingliz tili", "Matematika"],
    requirements: {
      minIelts: 5.5,
      minDtm: 150,
      note: "IELTS yoki ichki imtihon talab qilinadi.",
    },
    majors: [
      { id: "be", name: "Business Administration", partsOfDay: ["kunduzgi"] },
      { id: "ec", name: "Iqtisodiyot", partsOfDay: ["kunduzgi", "kechki"] },
      { id: "cs", name: "Kompyuter fanlari", partsOfDay: ["kunduzgi"] },
      { id: "law", name: "Tijorat huquqi", partsOfDay: ["kunduzgi"] },
    ],
  },
  {
    id: "inha",
    name: "Inha University in Tashkent",
    shortName: "IUT",
    logo: "I",
    city: "Toshkent",
    address: "Ziyolilar ko'chasi 9, Toshkent",
    description:
      "Janubiy Koreya Inha universitetining filiali. Axborot texnologiyalari va muhandislik yo'nalishlarida Koreya diplomi beriladi.",
    tuitionMin: 32_000_000,
    tuitionMax: 42_000_000,
    deadline: "2026-06-30",
    language: ["Ingliz"],
    offersFinancialAid: true,
    hasEntranceExam: true,
    entranceExamSubjects: ["Matematika", "Ingliz tili"],
    requirements: {
      minIelts: 5.0,
      minDtm: 140,
    },
    majors: [
      { id: "se", name: "Dasturiy injiniring", partsOfDay: ["kunduzgi"] },
      { id: "ice", name: "Axborot kommunikatsiya muhandisligi", partsOfDay: ["kunduzgi"] },
      { id: "lm", name: "Logistika menejmenti", partsOfDay: ["kunduzgi", "kechki"] },
    ],
  },
  {
    id: "tiiame",
    name: "TIIAME — Milliy tadqiqot universiteti",
    shortName: "TIIAME",
    logo: "T",
    city: "Toshkent",
    address: "Qori Niyoziy ko'chasi 39, Toshkent",
    description:
      "Suv resurslari, qishloq xo'jaligi mexanizatsiyasi va ekologiya yo'nalishlari bo'yicha yetakchi universitet.",
    tuitionMin: 18_000_000,
    tuitionMax: 26_000_000,
    deadline: "2026-08-01",
    language: ["O'zbek", "Rus", "Ingliz"],
    offersFinancialAid: false,
    hasEntranceExam: false,
    requirements: {
      minDtm: 120,
    },
    majors: [
      { id: "agr", name: "Agronomiya", partsOfDay: ["kunduzgi", "sirtqi"] },
      { id: "wr", name: "Suv resurslari", partsOfDay: ["kunduzgi"] },
      { id: "eco", name: "Ekologiya", partsOfDay: ["kunduzgi", "kechki"] },
    ],
  },
  {
    id: "ajou",
    name: "Ajou University in Tashkent",
    shortName: "AUIT",
    logo: "A",
    city: "Toshkent",
    address: "Mirzo Ulug'bek tumani, Toshkent",
    description:
      "Koreya Ajou universitetining O'zbekistondagi filiali. Muhandislik va arxitektura sohalarida xalqaro standartlar.",
    tuitionMin: 35_000_000,
    tuitionMax: 45_000_000,
    deadline: "2026-07-10",
    language: ["Ingliz"],
    offersFinancialAid: true,
    hasEntranceExam: true,
    entranceExamSubjects: ["Matematika", "Fizika"],
    requirements: {
      minIelts: 5.5,
      minDtm: 145,
    },
    majors: [
      { id: "ce", name: "Qurilish muhandisligi", partsOfDay: ["kunduzgi"] },
      { id: "arch", name: "Arxitektura", partsOfDay: ["kunduzgi"] },
      { id: "ee", name: "Elektr muhandisligi", partsOfDay: ["kunduzgi"] },
    ],
  },
  {
    id: "mdis",
    name: "Management Development Institute of Singapore",
    shortName: "MDIS",
    logo: "M",
    city: "Toshkent",
    address: "Buyuk ipak yo'li ko'chasi 7, Toshkent",
    description:
      "Singapur MDIS instituti — biznes, moliya va mehmondo'stlik yo'nalishlarida Singapur diplomi.",
    tuitionMin: 34_000_000,
    tuitionMax: 48_000_000,
    deadline: "2026-08-15",
    language: ["Ingliz"],
    offersFinancialAid: true,
    hasEntranceExam: false,
    requirements: {
      minIelts: 5.5,
      note: "IELTS bo'lmasa, ichki ingliz tili imtihoni topshiriladi.",
    },
    majors: [
      { id: "bf", name: "Bank ishi va moliya", partsOfDay: ["kunduzgi", "kechki"] },
      { id: "tm", name: "Turizm menejmenti", partsOfDay: ["kunduzgi"] },
      { id: "mkt", name: "Marketing", partsOfDay: ["kunduzgi", "kechki"] },
    ],
  },
  {
    id: "amity",
    name: "Amity University Tashkent",
    shortName: "Amity",
    logo: "A",
    city: "Toshkent",
    address: "Yangiyo'l yo'li, Toshkent viloyati",
    description:
      "Hindistonning Amity universiteti O'zbekistonda. IT, biznes va dizayn yo'nalishlarida ingliz tilida ta'lim.",
    tuitionMin: 28_000_000,
    tuitionMax: 38_000_000,
    deadline: "2026-07-25",
    language: ["Ingliz"],
    offersFinancialAid: true,
    hasEntranceExam: true,
    entranceExamSubjects: ["Ingliz tili", "Mantiq"],
    requirements: {
      minIelts: 5.0,
    },
    majors: [
      { id: "it", name: "Axborot texnologiyalari", partsOfDay: ["kunduzgi"] },
      { id: "ba", name: "Biznes boshqaruvi", partsOfDay: ["kunduzgi", "kechki"] },
      { id: "gd", name: "Grafik dizayn", partsOfDay: ["kunduzgi"] },
    ],
  },
];

export const getUniversity = (id: string) =>
  UNIVERSITIES.find((u) => u.id === id);

export const formatSom = (amount: number) =>
  new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const PART_OF_DAY_LABEL: Record<string, string> = {
  kunduzgi: "Kunduzgi",
  kechki: "Kechki",
  sirtqi: "Sirtqi",
};
