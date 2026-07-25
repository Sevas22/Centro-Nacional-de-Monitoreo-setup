-- DropForeignKey
ALTER TABLE "Municipality" DROP CONSTRAINT "Municipality_departmentId_fkey";

-- DropTable
DROP TABLE "AlertItem";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "Entity";

-- DropTable
DROP TABLE "Municipality";

-- DropTable
DROP TABLE "NewsSource";

-- DropEnum
DROP TYPE "ActivityLevel";

-- DropEnum
DROP TYPE "AlertSeverity";

-- DropEnum
DROP TYPE "EntityType";
