-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- AlterTable: agrega riskLevel con default temporal para poder rellenar las filas existentes
-- (clasificadas bajo el sistema viejo de sentimiento, sin evaluacion de riesgo real todavia)
-- de forma honesta -- "low" es el piso conservador, no una clasificacion inventada.
ALTER TABLE "NewsArticle" ADD COLUMN "riskLevel" "RiskLevel" NOT NULL DEFAULT 'low';

-- Quita la columna vieja de sentimiento, ya reemplazada por riskLevel en toda la app.
ALTER TABLE "NewsArticle" DROP COLUMN "sentiment";

-- El default temporal ya cumplio su proposito (rellenar filas existentes) -- de aqui en
-- adelante cada insert debe traer su propio riskLevel real, igual que ya pasa en
-- lib/news/ingest.ts.
ALTER TABLE "NewsArticle" ALTER COLUMN "riskLevel" DROP DEFAULT;

-- DropEnum
DROP TYPE "Sentiment";
