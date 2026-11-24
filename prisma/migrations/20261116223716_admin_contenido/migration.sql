-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('HERO', 'CATEGORIES', 'BEST_SELLERS', 'OFFERS', 'VOLUME_PRICING', 'SETS', 'BENEFITS', 'BANNER', 'PRODUCTS', 'TEXT');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSection" (
    "id" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "eyebrow" TEXT,
    "title" TEXT,
    "body" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "imageUrl" TEXT,
    "mobileImageUrl" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "HomeSection_sortOrder_idx" ON "HomeSection"("sortOrder");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
