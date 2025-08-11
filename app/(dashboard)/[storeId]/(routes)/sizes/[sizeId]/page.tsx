import prismadb from "@/lib/prismadb";
// import { SizeForm } from "./components/SizeForm";
import dynamic from "next/dynamic";
import Skeleton from "@/components/ui/skeleton";

const SizeForm = dynamic(
  () => import("./components/SizeForm").then((m) => m.SizeForm),
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

const SizePage = async ({
  params,
}: {
  params: { sizeId: string; storeId: string };
}) => {
  let size = null;
  if (params.sizeId !== "new") {
    size = await prismadb.size.findUnique({
      where: {
        id: parseInt(params.sizeId),
      },
    });
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeForm initialData={size} />
      </div>
    </div>
  );
};

export default SizePage;
