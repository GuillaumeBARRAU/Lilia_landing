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
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          pdfKey: true,
        },
      },
      lead: {
        select: {
          id: true,
          arrondissement: true,
        },
      },
    },
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

  let finalPdfKey = record.campaign.pdfKey;

  if (record.lead?.arrondissement) {
    const variant = await prisma.campaignPdfVariant.findUnique({
      where: {
        campaignId_arrondissement: {
          campaignId: record.campaign.id,
          arrondissement: record.lead.arrondissement,
        },
      },
      select: {
        pdfKey: true,
      },
    });

    if (variant?.pdfKey) {
      finalPdfKey = variant.pdfKey;
    }
  }

  if (!finalPdfKey) {
    return new NextResponse("No PDF configured for this campaign", {
      status: 500,
    });
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

  const signedUrl = await generateSignedPdfUrl(finalPdfKey);

  return NextResponse.redirect(signedUrl);
}