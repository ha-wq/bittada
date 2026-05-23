import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const UNIVERSITIES = [
  {
    slug: "westminster",
    name: "Westminster International University in Tashkent",
    shortName: "WIUT",
    logo: "W",
    city: "Toshkent",
    address: "Istiqbol ko'chasi 12, Toshkent",
    description:
      "Westminster Toshkentdagi xalqaro universiteti — Buyuk Britaniya diplomi, ingliz tilida ta'lim.",
    tuitionMin: 38_000_000,
    tuitionMax: 52_000_000,
    deadline: new Date("2026-07-15"),
    language: ["Ingliz"],
    offersFinancialAid: true,
    hasEntranceExam: true,
    minIelts: 5.5,
    minDtm: 150,
    requirementsNote: "IELTS yoki ichki imtihon talab qilinadi.",
    majors: [
      { name: "Business Administration", partsOfDay: ["kunduzgi"] },
      { name: "Iqtisodiyot", partsOfDay: ["kunduzgi", "kechki"] },
      { name: "Kompyuter fanlari", partsOfDay: ["kunduzgi"] },
      { name: "Tijorat huquqi", partsOfDay: ["kunduzgi"] },
    ],
  },
  {
    slug: "inha",
    name: "Inha University in Tashkent",
    shortName: "IUT",
    logo: "I",
    city: "Toshkent",
    address: "Ziyolilar ko'chasi 9, Toshkent",
    description:
      "Janubiy Koreya Inha universitetining filiali. Axborot texnologiyalari va muhandislik yo'nalishlarida Koreya diplomi.",
    tuitionMin: 32_000_000,
    tuitionMax: 42_000_000,
    deadline: new Date("2026-06-30"),
    language: ["Ingliz"],
    offersFinancialAid: true,
    hasEntranceExam: true,
    minIelts: 5.0,
    minDtm: 140,
    majors: [
      { name: "Dasturiy injiniring", partsOfDay: ["kunduzgi"] },
      { name: "Axborot kommunikatsiya muhandisligi", partsOfDay: ["kunduzgi"] },
      { name: "Logistika menejmenti", partsOfDay: ["kunduzgi", "kechki"] },
    ],
  },
  {
    slug: "tiiame",
    name: "TIIAME — Milliy tadqiqot universiteti",
    shortName: "TIIAME",
    logo: "T",
    city: "Toshkent",
    address: "Qori Niyoziy ko'chasi 39, Toshkent",
    description:
      "Suv resurslari, qishloq xo'jaligi mexanizatsiyasi va ekologiya yo'nalishlari bo'yicha yetakchi universitet.",
    tuitionMin: 18_000_000,
    tuitionMax: 26_000_000,
    deadline: new Date("2026-08-01"),
    language: ["O'zbek", "Rus", "Ingliz"],
    offersFinancialAid: false,
    hasEntranceExam: false,
    minDtm: 120,
    majors: [
      { name: "Agronomiya", partsOfDay: ["kunduzgi", "sirtqi"] },
      { name: "Suv resurslari", partsOfDay: ["kunduzgi"] },
      { name: "Ekologiya", partsOfDay: ["kunduzgi", "kechki"] },
    ],
  },
  {
    slug: "ajou",
    name: "Ajou University in Tashkent",
    shortName: "AUIT",
    logo: "A",
    city: "Toshkent",
    address: "Mirzo Ulug'bek tumani, Toshkent",
    description:
      "Koreya Ajou universitetining O'zbekistondagi filiali. Muhandislik va arxitektura sohalarida xalqaro standartlar.",
    tuitionMin: 35_000_000,
    tuitionMax: 45_000_000,
    deadline: new Date("2026-07-10"),
    language: ["Ingliz"],
    offersFinancialAid: true,
    hasEntranceExam: true,
    minIelts: 5.5,
    minDtm: 145,
    majors: [
      { name: "Qurilish muhandisligi", partsOfDay: ["kunduzgi"] },
      { name: "Arxitektura", partsOfDay: ["kunduzgi"] },
      { name: "Elektr muhandisligi", partsOfDay: ["kunduzgi"] },
    ],
  },
  {
    slug: "mdis",
    name: "Management Development Institute of Singapore",
    shortName: "MDIS",
    logo: "M",
    city: "Toshkent",
    address: "Buyuk ipak yo'li ko'chasi 7, Toshkent",
    description:
      "Singapur MDIS instituti — biznes, moliya va mehmondo'stlik yo'nalishlarida Singapur diplomi.",
    tuitionMin: 34_000_000,
    tuitionMax: 48_000_000,
    deadline: new Date("2026-08-15"),
    language: ["Ingliz"],
    offersFinancialAid: true,
    hasEntranceExam: false,
    minIelts: 5.5,
    requirementsNote: "IELTS bo'lmasa, ichki ingliz tili imtihoni topshiriladi.",
    majors: [
      { name: "Bank ishi va moliya", partsOfDay: ["kunduzgi", "kechki"] },
      { name: "Turizm menejmenti", partsOfDay: ["kunduzgi"] },
      { name: "Marketing", partsOfDay: ["kunduzgi", "kechki"] },
    ],
  },
  {
    slug: "amity",
    name: "Amity University Tashkent",
    shortName: "Amity",
    logo: "A",
    city: "Toshkent",
    address: "Yangiyo'l yo'li, Toshkent viloyati",
    description:
      "Hindistonning Amity universiteti O'zbekistonda. IT, biznes va dizayn yo'nalishlarida ingliz tilida ta'lim.",
    tuitionMin: 28_000_000,
    tuitionMax: 38_000_000,
    deadline: new Date("2026-07-25"),
    language: ["Ingliz"],
    offersFinancialAid: true,
    hasEntranceExam: true,
    minIelts: 5.0,
    majors: [
      { name: "Axborot texnologiyalari", partsOfDay: ["kunduzgi"] },
      { name: "Biznes boshqaruvi", partsOfDay: ["kunduzgi", "kechki"] },
      { name: "Grafik dizayn", partsOfDay: ["kunduzgi"] },
    ],
  },
];

async function main() {
  // Bootstrap super admin from env.
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@bittada.uz";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "changeme123";
  const adminName = process.env.SUPER_ADMIN_NAME || "Super Admin";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        fullName: adminName,
        role: "SUPER_ADMIN",
      },
    });
    console.log(`Super admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Super admin already exists: ${adminEmail}`);
  }

  for (const u of UNIVERSITIES) {
    const { majors, ...rest } = u;
    const existing = await prisma.university.findUnique({ where: { slug: u.slug } });
    if (existing) {
      console.log(`Skip ${u.slug} (exists)`);
      continue;
    }
    await prisma.university.create({
      data: {
        ...rest,
        majors: { create: majors },
      },
    });
    console.log(`Seeded ${u.slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
