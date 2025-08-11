import prismadb from "@/lib/prismadb";
// import { ColorForm } from "./components/ColorForm";
import dynamic from "next/dynamic";
import Skeleton from "@/components/ui/skeleton";

const ColorForm = dynamic(
  () => import("./components/ColorForm").then((m) => m.ColorForm),
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

const ColorPage = async ({
  params,
}: {
  params: { colorId: string; storeId: string };
}) => {
  let color = null;
  if (params.colorId !== "new") {
    color = await prismadb.color.findUnique({
      where: {
        id: parseInt(params.colorId),
      },
    });
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorForm initialData={color} />
      </div>
    </div>
  );
};

export default ColorPage;
