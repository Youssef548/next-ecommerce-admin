import { Prisma } from "@prisma/client";
import prismadb from "./prismadb";

// Types for the new many-to-many relationships
export type ProductWithNewRelations = Prisma.ProductGetPayload<{
  include: {
    categories: { include: { category: true } };
    sizes: { include: { size: true } };
    colors: { include: { color: true } };
    images: true;
  };
}>;

// Legacy compatible type that mimics the old single relationships
export type ProductWithLegacyRelations = {
  id: number;
  name: string;
  price: number;
  isFeatured: boolean;
  isArchived: boolean;
  storeId: number;
  createdAt: Date;
  updatedAt: Date;
  // Legacy single relationships (first item from arrays)
  category: { id: number; label: string; storeId: number } | null;
  size: { id: number; name: string; value: string; storeId: number } | null;
  color: { id: number; name: string; value: string; storeId: number } | null;
  images: Array<{ id: number; url: string; productId: number }>;
  // New array relationships for advanced usage
  categories: Array<{ id: number; label: string; storeId: number }>;
  sizes: Array<{ id: number; name: string; value: string; storeId: number }>;
  colors: Array<{ id: number; name: string; value: string; storeId: number }>;
};

/**
 * Converts new many-to-many product data to legacy-compatible format
 * This ensures backward compatibility with existing UI code
 */
export function adaptProductToLegacy(product: ProductWithNewRelations): ProductWithLegacyRelations {
  return {
    ...product,
    // Convert Decimal to number for backward compatibility
    price: Number(product.price),
    // Legacy single relationships (use first item for backward compatibility)
    category: product.categories[0]?.category || null,
    size: product.sizes[0]?.size || null,
    color: product.colors[0]?.color || null,
    // New array relationships
    categories: product.categories.map(pc => pc.category),
    sizes: product.sizes.map(ps => ps.size),
    colors: product.colors.map(pc => pc.color),
  };
}

/**
 * Enhanced product finder with backward compatibility
 */
export async function findProductsWithRelations(params: {
  storeId: number;
  categoryId?: number;
  sizeId?: number;
  colorId?: number;
  isFeatured?: boolean;
  isArchived?: boolean;
}) {
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      isArchived: params.isArchived ?? false,
      isFeatured: params.isFeatured,
      // Filter by relationships using junction tables
      ...(params.categoryId && {
        categories: {
          some: { categoryId: params.categoryId }
        }
      }),
      ...(params.sizeId && {
        sizes: {
          some: { sizeId: params.sizeId }
        }
      }),
      ...(params.colorId && {
        colors: {
          some: { colorId: params.colorId }
        }
      }),
    },
    include: {
      categories: { include: { category: true } },
      sizes: { include: { size: true } },
      colors: { include: { color: true } },
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert to legacy format for backward compatibility
  return products.map(adaptProductToLegacy);
}

/**
 * Create product with multiple relationships
 */
export async function createProductWithRelations(data: {
  name: string;
  price: number;
  isFeatured: boolean;
  isArchived: boolean;
  storeId: number;
  categoryIds: number[];
  sizeIds: number[];
  colorIds: number[];
  imageUrls: string[];
}) {
  return await prismadb.product.create({
    data: {
      name: data.name,
      price: data.price,
      isFeatured: data.isFeatured,
      isArchived: data.isArchived,
      storeId: data.storeId,
      categories: {
        create: data.categoryIds.map(categoryId => ({ categoryId }))
      },
      sizes: {
        create: data.sizeIds.map(sizeId => ({ sizeId }))
      },
      colors: {
        create: data.colorIds.map(colorId => ({ colorId }))
      },
      images: {
        create: data.imageUrls.map(url => ({ url }))
      }
    },
    include: {
      categories: { include: { category: true } },
      sizes: { include: { size: true } },
      colors: { include: { color: true } },
      images: true,
    }
  });
}

/**
 * Update product with multiple relationships
 */
export async function updateProductWithRelations(
  productId: number,
  data: {
    name?: string;
    price?: number;
    isFeatured?: boolean;
    isArchived?: boolean;
    categoryIds?: number[];
    sizeIds?: number[];
    colorIds?: number[];
    imageUrls?: string[];
  }
) {
  // Start transaction to handle relationship updates
  return await prismadb.$transaction(async (tx: Prisma.TransactionClient) => {
    // Update basic product data
    // const product = await tx.product.update({
    //   where: { id: productId },
    //   data: {
    //     ...(data.name && { name: data.name }),
    //     ...(data.price && { price: data.price }),
    //     ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
    //     ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
    //   }
    // });

    // Update relationships if provided
    if (data.categoryIds) {
      await tx.productCategory.deleteMany({ where: { productId } });
      await tx.productCategory.createMany({
        data: data.categoryIds.map(categoryId => ({ productId, categoryId }))
      });
    }

    if (data.sizeIds) {
      await tx.productSize.deleteMany({ where: { productId } });
      await tx.productSize.createMany({
        data: data.sizeIds.map(sizeId => ({ productId, sizeId }))
      });
    }

    if (data.colorIds) {
      await tx.productColor.deleteMany({ where: { productId } });
      await tx.productColor.createMany({
        data: data.colorIds.map(colorId => ({ productId, colorId }))
      });
    }

    if (data.imageUrls) {
      await tx.image.deleteMany({ where: { productId } });
      await tx.image.createMany({
        data: data.imageUrls.map(url => ({ productId, url }))
      });
    }

    // Return updated product with relationships
    return await tx.product.findUnique({
      where: { id: productId },
      include: {
        categories: { include: { category: true } },
        sizes: { include: { size: true } },
        colors: { include: { color: true } },
        images: true,
      }
    });
  });
}
