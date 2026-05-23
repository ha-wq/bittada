import { NextRequest } from "next/server";
import { stat, readFile } from "fs/promises";
import { requireUser } from "@/lib/session";
import { uploadPath } from "@/lib/upload";
import { prisma } from "@/lib/db";
import { error } from "@/lib/api";
import path from "path";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  // prevent path traversal
  const safe = path.basename(name);

  // Public assets (e.g. university logos) are servable without auth.
  // Everything else requires a signed-in user.
  const isPublicAsset =
    (await prisma.university.count({ where: { logo: safe } })) > 0;

  if (!isPublicAsset) {
    try {
      await requireUser();
    } catch {
      return error("Avtorizatsiya talab qilinadi", 401);
    }
  }

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
      "cache-control": isPublicAsset
        ? "public, max-age=86400"
        : "private, max-age=3600",
    },
  });
}
