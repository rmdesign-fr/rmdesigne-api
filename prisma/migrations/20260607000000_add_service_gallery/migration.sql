-- CreateTable
CREATE TABLE "ServiceGallery" (
    "id" TEXT NOT NULL,
    "serviceSlug" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceGallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceGallery_serviceSlug_idx" ON "ServiceGallery"("serviceSlug");
