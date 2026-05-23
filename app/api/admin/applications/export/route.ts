import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/session";
import { error } from "@/lib/api";

export async function GET() {
  let admin;
  try {
    admin = await requireRole("UNIVERSITY_ADMIN", "SUPER_ADMIN");
  } catch (e) {
    if (e instanceof AuthError) return error(e.message, e.status);
    throw e;
  }
  if (!admin.managesUniversityId) return error("Universitet biriktirilmagan.", 400);

  const apps = await prisma.application.findMany({
    where: {
      universityId: admin.managesUniversityId,
      status: { not: "YUBORILMAGAN" },
    },
    include: { user: { include: { profile: true } }, major: true },
    orderBy: { submittedAt: "desc" },
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Arizalar");
  ws.columns = [
    { header: "Topshirgan sana", key: "submittedAt", width: 18 },
    { header: "F.I.Sh.", key: "fullName", width: 28 },
    { header: "Email", key: "email", width: 28 },
    { header: "Telefon", key: "phone", width: 16 },
    { header: "Passport", key: "passport", width: 14 },
    { header: "Maktab", key: "school", width: 24 },
    { header: "Bitirgan yil", key: "year", width: 12 },
    { header: "Mutaxassislik", key: "major", width: 24 },
    { header: "O'qish shakli", key: "partOfDay", width: 12 },
    { header: "Grant", key: "grant", width: 8 },
    { header: "DTM", key: "dtm", width: 8 },
    { header: "IELTS", key: "ielts", width: 8 },
    { header: "SAT", key: "sat", width: 8 },
    { header: "Holat", key: "status", width: 18 },
  ];

  for (const a of apps) {
    const p = a.user.profile;
    const ielts = (p?.ielts as { overall?: string } | null)?.overall;
    const dtm = (p?.dtm as { total?: string } | null)?.total;
    const sat = (p?.sat as { total?: string } | null)?.total;
    ws.addRow({
      submittedAt: a.submittedAt?.toISOString().slice(0, 10) || "",
      fullName: a.user.fullName,
      email: a.user.email,
      phone: p?.phone || "",
      passport: p?.passportId || "",
      school: p?.school || "",
      year: p?.graduationYear || "",
      major: a.major.name,
      partOfDay: a.partOfDay,
      grant: a.financialAid ? "Ha" : "Yo'q",
      dtm: dtm || "",
      ielts: ielts || "",
      sat: sat || "",
      status: a.status,
    });
  }

  ws.getRow(1).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer as unknown as ArrayBuffer, {
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="arizalar-${Date.now()}.xlsx"`,
    },
  });
}
