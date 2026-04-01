import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const form = await req.formData();

  const pdfKey = String(form.get("pdfKey") ?? "").trim();

  if (!pdfKey) {
    return NextResponse.json({ error: "pdfKey is required" }, { status: 400 });
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data: { pdfKey },
    select: {
      id: true,
      title: true,
      slug: true,
      pdfKey: true,
    },
  });

  return NextResponse.redirect(new URL("/admin?updated=1", req.url));
}