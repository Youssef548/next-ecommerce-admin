import prismadb from "@/lib/prismadb";
import { Category, Color, Size } from "@prisma/client";
import dynamic from "next/dynamic";
import Skeleton from "@/components/ui/skeleton";

const ProductForm = dynamic(
  () => import("./components/ProductForm").then((m) => m.ProductForm),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    ),
  }
);

const ProductPage = async ({
  params,
}: {
  params: { productId: string; storeId: string };
}) => {
  let product = null;
  if (params.productId !== "new") {
    product = await prismadb.product.findUnique({
      where: {
        id: parseInt(params.productId),
      },
      include: {
        images: true,
        categories: { include: { category: true } },
        sizes: { include: { size: true } },
        colors: { include: { color: true } },
      },
    });

    // Transform the data to match the expected format for the form
    if (product) {
      product = {
        ...product,
        categories: product.categories.map((pc: { category: Category }) => pc.category),
        sizes: product.sizes.map((ps: { size: Size }) => ps.size),
        colors: product.colors.map((pc: { color: Color }) => pc.color),
      };
    }
  }

  const categories = await prismadb.category.findMany({
    where: {
      storeId: parseInt(params.storeId),
    },
  });

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: parseInt(params.storeId),
    },
  });

  const colors = await prismadb.color.findMany({
    where: {
      storeId: parseInt(params.storeId),
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          initialData={product}
          categories={categories}
          sizes={sizes}
          colors={colors}
        />
      </div>
    </div>
  );
};

export default ProductPage;
