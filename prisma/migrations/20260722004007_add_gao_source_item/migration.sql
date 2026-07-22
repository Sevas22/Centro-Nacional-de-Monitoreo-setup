-- CreateTable
CREATE TABLE "GaoSourceItem" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "categories" TEXT[],
    "mentionedGroups" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GaoSourceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GaoSourceItem_link_key" ON "GaoSourceItem"("link");

-- CreateIndex
CREATE INDEX "GaoSourceItem_source_idx" ON "GaoSourceItem"("source");

-- CreateIndex
CREATE INDEX "GaoSourceItem_publishedAt_idx" ON "GaoSourceItem"("publishedAt");
