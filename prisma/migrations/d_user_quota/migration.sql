-- AlterTable: add userIdentifier to Scan
ALTER TABLE "Scan" ADD COLUMN "userIdentifier" TEXT;
CREATE INDEX "Scan_userIdentifier_idx" ON "Scan"("userIdentifier");

-- CreateTable: UserQuota
CREATE TABLE "UserQuota" (
    "id" TEXT NOT NULL,
    "userIdentifier" TEXT NOT NULL,
    "freeScansUsed" INTEGER NOT NULL DEFAULT 0,
    "paidCredits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserQuota_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserQuota_userIdentifier_key" ON "UserQuota"("userIdentifier");
CREATE INDEX "UserQuota_userIdentifier_idx" ON "UserQuota"("userIdentifier");

-- CreateTable: StripePayment
CREATE TABLE "StripePayment" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userIdentifier" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StripePayment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StripePayment_sessionId_key" ON "StripePayment"("sessionId");
CREATE INDEX "StripePayment_userIdentifier_idx" ON "StripePayment"("userIdentifier");
CREATE INDEX "StripePayment_sessionId_idx" ON "StripePayment"("sessionId");
