import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import crypto from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const campaign = await prisma.campaign.findUnique({
    where: { slug: "guide-achat" },
    select: { id: true, slug: true, pdfKey: true },
  });

  if (!campaign) {
    throw new Error("Campagne guide-achat introuvable");
  }

  const existing = await prisma.campaignPdfVariant.findUnique({
    where: {
      campaignId_arrondissement: {
        campaignId: campaign.id,
        arrondissement: "13013",
      },
    },
  });

  let variant;

  if (existing) {
    variant = await prisma.campaignPdfVariant.update({
      where: { id: existing.id },
      data: {
        pdfKey: "Guide Immo Lilia 13013.pdf",
      },
    });
  } else {
    variant = await prisma.campaignPdfVariant.create({
      data: {
        id: crypto.randomUUID(),
        campaignId: campaign.id,
        arrondissement: "13013",
        pdfKey: "Guide Immo Lilia 13013.pdf",
      },
    });
  }

  console.log("Variant créée / mise à jour :", variant);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });