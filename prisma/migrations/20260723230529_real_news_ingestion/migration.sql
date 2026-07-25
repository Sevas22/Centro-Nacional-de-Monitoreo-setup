-- AlterTable
ALTER TABLE "NewsArticle" DROP COLUMN "entities",
DROP COLUMN "isBreaking",
DROP COLUMN "riskScore",
DROP COLUMN "sentimentScore",
DROP COLUMN "time",
DROP COLUMN "viewCount",
ADD COLUMN     "publishedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "sourceUrl" SET NOT NULL,
ALTER COLUMN "municipality" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_sourceUrl_key" ON "NewsArticle"("sourceUrl");

-- CreateIndex
CREATE INDEX "NewsArticle_department_idx" ON "NewsArticle"("department");

-- CreateIndex
CREATE INDEX "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt");
