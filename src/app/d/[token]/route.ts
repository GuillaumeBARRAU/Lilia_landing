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
    include: { campaign: true },
  });

  if (!record) return new NextResponse("Invalid token", { status: 404 });
  if (record.expiresAt < new Date()) return new NextResponse("Token expired", { status: 410 });
  if (record.downloadCount >= record.maxDownloads) {
  return new NextResponse("Download limit reached", { status: 410 });
}
  // MVP: on marque comme utilisé, puis on redirige vers un PDF local
await prisma.downloadToken.update({
  where: { id: record.id },
  data: {
    downloadCount: { increment: 1 },
  },
});

  // Mets un fichier PDF dans /public/guide.pdf pour tester
  if (record.expiresAt < new Date()) {
    return new NextResponse("Token expired", { status: 410 });
  }

  if (record.downloadCount >= record.maxDownloads) {
    return new NextResponse("Download limit reached", { status: 410 });
  }

  // Incrémente le compteur
  await prisma.downloadToken.update({
    where: { id: record.id },
    data: { downloadCount: { increment: 1 } },
  });

  // 🔐 Génération URL S3 signée
  const signedUrl = await generateSignedPdfUrl(
    process.env.S3_PDF_KEY!
  );

  return NextResponse.redirect(signedUrl);
}