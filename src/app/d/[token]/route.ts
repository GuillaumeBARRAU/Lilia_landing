import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSignedPdfUrl } from "@/lib/s3";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const record = await prisma.downloadToken.findUnique({
    where: { token },
  });

  if (!record) {
    return new NextResponse("Invalid token", { status: 404 });
  }

  if (record.expiresAt < new Date()) {
    return new NextResponse("Token expired", { status: 410 });
  }

  if (record.downloadCount >= record.maxDownloads) {
    return new NextResponse("Download limit reached", { status: 410 });
  }

  await prisma.downloadToken.update({
    where: { id: record.id },
    data: {
      downloadCount: { increment: 1 },
    },
  });

  await prisma.downloadEvent.create({
    data: {
      downloadTokenId: record.id,
    },
  });

  const key = process.env.S3_PDF_KEY;
  if (!key) {
    return new NextResponse("S3_PDF_KEY missing", { status: 500 });
  }

  const signedUrl = await generateSignedPdfUrl(key);
  return NextResponse.redirect(signedUrl);
}