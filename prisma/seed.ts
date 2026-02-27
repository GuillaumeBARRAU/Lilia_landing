import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Check your .env file.");
}

// Pool pg standard
const pool = new Pool({ connectionString: DATABASE_URL });

// Adapter Prisma v7
const adapter = new PrismaPg(pool);

// ✅ PrismaClient v7 : nécessite adapter OU accelerateUrl
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.campaign.findUnique({
    where: { slug: "guide-achat" },
  });

  if (existing) {
    console.log("Campaign already exists ✅");
    return;
  }

  await prisma.campaign.create({
    data: {
      slug: "guide-achat",
      title: "Guide Achat Immobilier",
      description:
        "Découvrez les 10 erreurs à éviter avant d'acheter un bien immobilier.",
      pdfKey: "pdfs/guide-achat.pdf",
      isActive: true,
    },
  });

  console.log("Campaign created ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // important: ferme le pool pg
  });