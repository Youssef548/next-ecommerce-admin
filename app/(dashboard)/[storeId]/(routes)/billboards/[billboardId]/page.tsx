import prismadb from "@/lib/prismadb";
// import { BillboardForm } from "./components/BillboardForm";
import dynamic from "next/dynamic";
import Skeleton from "@/components/ui/skeleton";

const BillboardForm = dynamic(
  () => import("./components/BillboardForm").then((m) => m.BillboardForm),
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

const BillboardPage = async ({
  params,
}: {
  params: { billboardId: string };
}) => {
  let billboard = null;
  if (params.billboardId !== "new") {
    billboard = await prismadb.billboard.findUnique({
      where: {
        id: parseInt(params.billboardId),
      },
    });
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardForm initialData={billboard} />
      </div>
    </div>
  );
};

export default BillboardPage;
