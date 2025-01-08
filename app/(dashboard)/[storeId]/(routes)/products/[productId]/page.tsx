import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/ProductForm";

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
      },
    });
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
