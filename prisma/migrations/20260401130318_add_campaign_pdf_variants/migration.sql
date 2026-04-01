-- CreateTable
CREATE TABLE "CampaignPdfVariant" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "arrondissement" TEXT NOT NULL,
    "pdfKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignPdfVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignPdfVariant_campaignId_arrondissement_key" ON "CampaignPdfVariant"("campaignId", "arrondissement");

-- AddForeignKey
ALTER TABLE "CampaignPdfVariant" ADD CONSTRAINT "CampaignPdfVariant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
