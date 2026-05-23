import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const MAX_FILE_SIZE = 2 * 1024 * 1024;
export const ALLOWED_IMAGE = ["image/jpeg", "image/png"];
export const ALLOWED_DOC = [...ALLOWED_IMAGE, "application/pdf"];

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

export async function saveUpload(
  file: File,
  allowed: string[] = ALLOWED_DOC,
): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Fayl hajmi 2MB dan oshmasligi kerak.`);
  }
  if (!allowed.includes(file.type)) {
    throw new Error("Bu fayl turi qabul qilinmaydi.");
  }

  await mkdir(UPLOADS_DIR, { recursive: true });
  const ext = EXT_BY_MIME[file.type] || "bin";
  const name = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, name), bytes);
  return name;
}

export function uploadPath(name: string) {
  return path.join(UPLOADS_DIR, name);
}
