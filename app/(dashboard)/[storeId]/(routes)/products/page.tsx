import { format } from "date-fns";

import { ProductClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { ProductColumn } from "./components/columns";
import { priceFormatter } from "@/lib/utils";
import { Prisma } from "@prisma/client";

const ProductsPage = async ({
  params: { storeId },
}: {
  params: { storeId: string };
}) => {


  const products = await prismadb.product.findMany({
    where: {
      storeId: parseInt(storeId),
    },
    include: {
      category: true,
      size: true,
      color: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts: ProductColumn[] = products.map(
    (item: any) => ({
      id: item.id,
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: priceFormatter.format(Number(item.price)),
      category: item.category.label,
      size: item.size.name,
      color: item.color.value,
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
