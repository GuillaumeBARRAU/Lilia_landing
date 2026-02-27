-- AlterTable
ALTER TABLE "DownloadToken" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxDownloads" INTEGER NOT NULL DEFAULT 3;
