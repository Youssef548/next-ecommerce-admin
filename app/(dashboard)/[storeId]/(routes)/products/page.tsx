import { format } from "date-fns";

import { ProductClient } from "./components/client";
import { ProductColumn } from "./components/columns";
import { priceFormatter } from "@/lib/utils";
import { findProductsWithRelations, ProductWithLegacyRelations } from "@/lib/product-helpers";

const ProductsPage = async ({
  params: { storeId },
}: {
  params: { storeId: string };
}) => {

  const products = await findProductsWithRelations({
    storeId: parseInt(storeId),
  });

  const formattedProducts: ProductColumn[] = products.map(
    (item: ProductWithLegacyRelations) => ({
      id: item.id.toString(),
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: priceFormatter.format(Number(item.price)),
      // Use full arrays instead of just first values
      categories: item.categories || [],
      sizes: item.sizes || [],
      colors: item.colors || [],
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    })
  );

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient products={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
