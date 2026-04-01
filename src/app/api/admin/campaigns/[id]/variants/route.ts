import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const form = await req.formData();

  const arrondissement = String(form.get("arrondissement") ?? "").trim();
  const pdfKey = String(form.get("pdfKey") ?? "").trim();

  if (!arrondissement || !pdfKey) {
    return NextResponse.redirect(new URL("/admin?variantError=1", req.url));
  }

  // On vérifie si une variante existe déjà
  const existing = await prisma.campaignPdfVariant.findUnique({
    where: {
      campaignId_arrondissement: {
        campaignId: id,
        arrondissement,
      },
    },
  });

  if (existing) {
    // Update
    await prisma.campaignPdfVariant.update({
      where: { id: existing.id },
      data: { pdfKey },
    });
  } else {
    // Create avec ID manuel
    await prisma.campaignPdfVariant.create({
      data: {
        id: crypto.randomUUID(), // 🔥 IMPORTANT
        campaignId: id,
        arrondissement,
        pdfKey,
      },
    });
  }

  return NextResponse.redirect(new URL("/admin?variantUpdated=1", req.url));
}