import { format } from "date-fns";

import { CategoryClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { CategoryColumn } from "./components/columns";

const CategoriesPage = async ({
  params: { storeId },
}: {
  params: { storeId: string };
}) => {
  const categories = await prismadb.category.findMany({
    where: {
      storeId: parseInt(storeId),
    },
    include: {
      billboard: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCategories: CategoryColumn[] = categories.map(
    (item: CategoryColumn) => ({
      id: item.id,
      name: item.label,
      billboardLabel: item?.billboard?.label || "No billboard",
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    })
  );

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryClient categories={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;
