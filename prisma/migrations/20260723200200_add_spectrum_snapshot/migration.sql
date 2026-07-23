-- CreateTable
CREATE TABLE "SpectrumSnapshot" (
    "id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tempC" DOUBLE PRECISION NOT NULL,
    "humidityPct" DOUBLE PRECISION NOT NULL,
    "precipitationMm" DOUBLE PRECISION NOT NULL,
    "stability" TEXT NOT NULL,
    "attenuationDbKm" DOUBLE PRECISION NOT NULL,
    "refractivity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SpectrumSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpectrumSnapshot_department_capturedAt_idx" ON "SpectrumSnapshot"("department", "capturedAt");
