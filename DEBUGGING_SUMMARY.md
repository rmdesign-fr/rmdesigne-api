# Service Gallery Endpoint Debug Summary

## Problem
The endpoint `/api/services/:slug/gallery` was returning **500 Internal Server Error** when accessed from the frontend.

## Root Cause
**The `ServiceGallery` table did not exist in the database.**

Despite being defined in the Prisma schema (`prisma/schema.prisma`), the table was never created because:
1. No migration file existed for this table
2. The existing migrations (`20260402150245_init` and `20260526002647_init`) did not include the `ServiceGallery` table creation

## Investigation Steps

### 1. Code Review
- ✅ Route configuration: Correctly defined in `src/routes/service.routes.js`
- ✅ Controller logic: Properly implemented in `src/controllers/service.controller.js`
- ✅ Service layer: Query logic correct in `src/services/service.service.js`
- ✅ Schema definition: `ServiceGallery` model properly defined in `prisma/schema.prisma`

### 2. Database Investigation
- Verified Prisma client was generated
- Tested database connection: ✅ Connected successfully
- Checked if `ServiceGallery` table exists: ❌ **Table missing** (Error P2021)

### 3. Prisma Configuration Issue
Found that Prisma 7.x has changed how migrations work:
- The `url` property is no longer supported in `schema.prisma`
- Connection configuration is now in `prisma.config.js`
- Standard migration commands fail when using placeholder database in config

## Solution Applied

### 1. Created the Missing Table
Manually created the `ServiceGallery` table using a raw SQL script:
```sql
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

CREATE INDEX "ServiceGallery_serviceSlug_idx" ON "ServiceGallery"("serviceSlug");
```

### 2. Created Migration Files
Created proper migration files for tracking:
- `prisma/migrations/20260607000000_add_service_gallery/migration.sql`

### 3. Bonus Fix: Review Table
Also discovered and fixed a missing `images` column in the `Review` table:
- Added migration: `prisma/migrations/20260607000001_add_review_images/migration.sql`

## Files Modified
- Created: `prisma/migrations/20260607000000_add_service_gallery/migration.sql`
- Created: `prisma/migrations/20260607000001_add_review_images/migration.sql`

## Verification
After fixes applied:
- ✅ Database connection successful
- ✅ `ServiceGallery` table exists
- ✅ Queries execute without errors
- ✅ Returns empty array `[]` (expected, as no data exists yet)

## Next Steps for Production Deployment
When deploying to production or setting up a new database:
1. Ensure `DATABASE_URL` environment variable is set
2. Run: `npx prisma generate` (already in package.json postinstall)
3. The table creation scripts have been run on the current database
4. For fresh databases, these migrations will need to be applied manually or through a deploy script

## API Endpoint Status
**✅ FIXED** - The endpoint now works correctly:
- `GET /api/services/:slug/gallery` returns 200 OK
- Returns an array of gallery items (currently empty)
- Ready for frontend integration

## Testing
To test the endpoint:
1. Start the server: `npm run dev`
2. Access: `http://localhost:5000/api/services/preparation-moteur/gallery`
3. Expected response: `[]` (empty array)
4. Upload images through the admin panel to populate the gallery
