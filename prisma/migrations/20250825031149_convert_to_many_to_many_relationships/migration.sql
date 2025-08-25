/*
  Warnings:

  - You are about to drop the column `categoryId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `colorId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sizeId` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "products_categoryId_idx";

-- DropIndex
DROP INDEX "products_colorId_idx";

-- DropIndex
DROP INDEX "products_sizeId_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "categoryId",
DROP COLUMN "colorId",
DROP COLUMN "sizeId";

-- CreateTable
CREATE TABLE "product_categories" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sizes" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "sizeId" INTEGER NOT NULL,

    CONSTRAINT "product_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_colors" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "colorId" INTEGER NOT NULL,

    CONSTRAINT "product_colors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_categories_productId_idx" ON "product_categories"("productId");

-- CreateIndex
CREATE INDEX "product_categories_categoryId_idx" ON "product_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_productId_categoryId_key" ON "product_categories"("productId", "categoryId");

-- CreateIndex
CREATE INDEX "product_sizes_productId_idx" ON "product_sizes"("productId");

-- CreateIndex
CREATE INDEX "product_sizes_sizeId_idx" ON "product_sizes"("sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "product_sizes_productId_sizeId_key" ON "product_sizes"("productId", "sizeId");

-- CreateIndex
CREATE INDEX "product_colors_productId_idx" ON "product_colors"("productId");

-- CreateIndex
CREATE INDEX "product_colors_colorId_idx" ON "product_colors"("colorId");

-- CreateIndex
CREATE UNIQUE INDEX "product_colors_productId_colorId_key" ON "product_colors"("productId", "colorId");
