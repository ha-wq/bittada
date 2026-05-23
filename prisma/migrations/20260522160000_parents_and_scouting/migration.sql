-- Add PARENT role
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PARENT';

-- Parent/child link status
DO $$ BEGIN
  CREATE TYPE "LinkStatus" AS ENUM ('PENDING', 'APPROVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- User: claim code for parent linking
ALTER TABLE "User"
  ADD COLUMN "claimCode" TEXT,
  ADD COLUMN "claimCodeExpiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "User_claimCode_key" ON "User"("claimCode");

-- ParentLink table
CREATE TABLE "ParentLink" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ParentLink_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ParentLink_parentId_childId_key" ON "ParentLink"("parentId", "childId");
CREATE INDEX "ParentLink_childId_idx" ON "ParentLink"("childId");
CREATE INDEX "ParentLink_parentId_idx" ON "ParentLink"("parentId");
ALTER TABLE "ParentLink" ADD CONSTRAINT "ParentLink_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParentLink" ADD CONSTRAINT "ParentLink_childId_fkey"
  FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Profile: scouting fields
ALTER TABLE "Profile"
  ADD COLUMN "scoutingEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "scoutCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "scoutKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "scoutPartsOfDay" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "scoutLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "scoutWillingTest" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "scoutTuitionMax" INTEGER;
