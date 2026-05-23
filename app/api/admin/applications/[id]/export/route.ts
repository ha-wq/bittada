import { readFile } from "fs/promises";
import JSZip from "jszip";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { uploadPath } from "@/lib/upload";
import { error } from "@/lib/api";

type Cert = { certificate?: string };
type MilliySubject = { subject?: string; score?: string; certificate?: string };

function safeSlug(s: string) {
  return (
    s
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 60) || "student"
  );
}

async function addFileToZip(
  zip: JSZip,
  folder: string,
  niceName: string,
  storedFilename: string | null | undefined,
) {
  if (!storedFilename) return;
  try {
    const buf = await readFile(uploadPath(storedFilename));
    const ext = storedFilename.split(".").pop() || "bin";
    zip.file(`${folder}/${niceName}.${ext}`, buf);
  } catch {
    // file missing on disk — skip silently
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const admin = await requireRole("UNIVERSITY_ADMIN", "SUPER_ADMIN");
    if (!admin.managesUniversityId) {
      return error("Universitet biriktirilmagan.", 403);
    }

    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        major: true,
        university: true,
        examRegistration: { include: { exam: true } },
      },
    });
    if (!app || app.universityId !== admin.managesUniversityId) {
      return error("Ariza topilmadi.", 404);
    }

    const zip = new JSZip();
    const p = app.user.profile;
    const folder = "Hujjatlar";

    // README / summary
    const lines: string[] = [];
    lines.push(`Talaba: ${app.user.fullName}`);
    lines.push(`Email: ${app.user.email}`);
    lines.push(`Mutaxassislik: ${app.major.name}`);
    lines.push(`O'qish shakli: ${app.partOfDay}`);
    lines.push(`Grant: ${app.financialAid ? "Ha" : "Yo'q"}`);
    lines.push(`Status: ${app.status}`);
    if (app.submittedAt)
      lines.push(`Yuborilgan: ${app.submittedAt.toISOString()}`);
    lines.push("");
    lines.push("--- Profil ---");
    if (p) {
      lines.push(`Telefon: ${p.phone ?? "—"}`);
      lines.push(`Passport: ${p.passportId ?? "—"}`);
      lines.push(`Maktab: ${p.school ?? "—"}`);
      lines.push(`Bitirgan: ${p.graduationYear ?? "—"}`);
      lines.push(`Manzil: ${p.address ?? "—"}`);
      lines.push(`Fuqarolik: ${p.citizenship ?? "—"}`);
      lines.push("");
      lines.push("--- Test natijalari ---");
      if (p.dtm) lines.push(`DTM: ${JSON.stringify(p.dtm)}`);
      if (p.ielts) lines.push(`IELTS: ${JSON.stringify(p.ielts)}`);
      if (p.sat) lines.push(`SAT: ${JSON.stringify(p.sat)}`);
      if (p.milliySertifikat)
        lines.push(`Milliy: ${JSON.stringify(p.milliySertifikat)}`);
    }
    zip.file("malumot.txt", lines.join("\n"));
    zip.file("malumot.json", JSON.stringify(app, null, 2));

    if (p) {
      await addFileToZip(zip, folder, "rasm", p.photo);
      await addFileToZip(zip, folder, "id_karta_old", p.idCardFront);
      await addFileToZip(zip, folder, "id_karta_orqa", p.idCardBack);
      await addFileToZip(zip, folder, "diplom", p.diploma);

      const dtm = p.dtm as Cert | null;
      await addFileToZip(zip, folder, "dtm_sertifikat", dtm?.certificate);

      const ielts = p.ielts as Cert | null;
      await addFileToZip(zip, folder, "ielts_sertifikat", ielts?.certificate);

      const sat = p.sat as Cert | null;
      await addFileToZip(zip, folder, "sat_sertifikat", sat?.certificate);

      const milliy = p.milliySertifikat as
        | { subjects?: MilliySubject[] }
        | null;
      const subjects = milliy?.subjects || [];
      for (const s of subjects) {
        if (s.certificate) {
          await addFileToZip(
            zip,
            folder,
            `milliy_${safeSlug(s.subject || "fan")}`,
            s.certificate,
          );
        }
      }
    }

    const bytes = await zip.generateAsync({ type: "nodebuffer" });
    const filename = `${safeSlug(app.user.fullName)}_${app.id.slice(0, 6)}.zip`;

    return new Response(new Uint8Array(bytes), {
      headers: {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Xatolik yuz berdi.", 400);
  }
}
