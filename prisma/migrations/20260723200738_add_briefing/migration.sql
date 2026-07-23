-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceSummary" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Briefing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Briefing_kind_generatedAt_idx" ON "Briefing"("kind", "generatedAt");
