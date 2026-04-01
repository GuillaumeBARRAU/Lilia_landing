import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadPdfToS3 } from "@/lib/s3";

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "")
    .toLowerCase();
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const form = await req.formData();

  const file = form.get("pdf");

  if (!file || !(file instanceof File)) {
    return NextResponse.redirect(new URL("/admin?uploadError=1", req.url));
  }

  if (file.type !== "application/pdf") {
    return NextResponse.redirect(new URL("/admin?uploadError=type", req.url));
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { id: true, slug: true, title: true },
  });

  if (!campaign) {
    return NextResponse.redirect(new URL("/admin?uploadError=campaign", req.url));
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = sanitizeFileName(file.name);
  const key = `campaigns/${campaign.slug}/${Date.now()}-${safeName}`;

  await uploadPdfToS3({
    key,
    body: buffer,
    contentType: file.type,
  });

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { pdfKey: key },
  });

  return NextResponse.redirect(new URL("/admin?uploaded=1", req.url));
}