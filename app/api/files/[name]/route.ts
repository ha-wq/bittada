import { NextRequest } from "next/server";
import { stat, readFile } from "fs/promises";
import { requireUser } from "@/lib/session";
import { uploadPath } from "@/lib/upload";
import { error } from "@/lib/api";
import path from "path";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    // Any authenticated user can fetch — owner check would require linking files to users.
    // For now keep simple: must be signed in.
    await requireUser();
  } catch {
    return error("Avtorizatsiya talab qilinadi", 401);
  }

  const { name } = await params;
  // prevent path traversal
  const safe = path.basename(name);
  const filePath = uploadPath(safe);

  try {
    await stat(filePath);
  } catch {
    return error("Fayl topilmadi", 404);
  }

  const ext = safe.split(".").pop()?.toLowerCase() || "";
  const mime = MIME_BY_EXT[ext] || "application/octet-stream";
  const data = await readFile(filePath);

  const isDownload = req.nextUrl.searchParams.get("download") === "1";
  const disposition = isDownload
    ? `attachment; filename="${safe}"`
    : `inline; filename="${safe}"`;

  return new Response(new Uint8Array(data), {
    headers: {
      "content-type": mime,
      "content-disposition": disposition,
      "cache-control": "private, max-age=3600",
    },
  });
}
