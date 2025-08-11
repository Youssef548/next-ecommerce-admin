import prismadb from "@/lib/prismadb";
// import { CategoryForm } from "./components/CategoryForm";
import dynamic from "next/dynamic";
import Skeleton from "@/components/ui/skeleton";

const CategoryForm = dynamic(
  () => import("./components/CategoryForm").then((m) => m.CategoryForm),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    ),
  }
);

const CategoryPage = async ({
  params,
}: {
  params: { categoryId: string; storeId: string };
}) => {
  let category = null;
  if (params.categoryId !== "new") {
    category = await prismadb.category.findUnique({
      where: {
        id: parseInt(params.categoryId),
      },
    });
  }

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: parseInt(params.storeId),
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm initialData={category} billboards={billboards} />
      </div>
    </div>
  );
};

export default CategoryPage;
