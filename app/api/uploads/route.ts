import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { saveUpload, ALLOWED_IMAGE, ALLOWED_DOC } from "@/lib/upload";

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireUser();
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const kind = (form.get("kind") as string) || "doc";
    if (!file) throw new Error("Fayl tanlanmagan.");

    const allowed = kind === "image" ? ALLOWED_IMAGE : ALLOWED_DOC;
    const name = await saveUpload(file, allowed);
    return { name };
  });
}
