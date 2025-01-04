import { format } from "date-fns";

import { SizeClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { SizeColumn } from "./components/columns";

const SizesPage = async ({
  params: { storeId },
}: {
  params: { storeId: string };
}) => {
  const sizes = await prismadb.size.findMany({
    where: {
      storeId: parseInt(storeId),
    },
  });

  const formattedSizes: SizeColumn[] = sizes.map((item: SizeColumn) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeClient sizes={formattedSizes} />
      </div>
    </div>
  );
};

export default SizesPage;
