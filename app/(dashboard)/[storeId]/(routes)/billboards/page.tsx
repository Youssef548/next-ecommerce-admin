import { format } from "date-fns";

import { BillboardClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { BillboardColumn } from "./components/columns";

const BillboardsPage = async ({
  params: { storeId },
}: {
  params: { storeId: string };
}) => {
  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: parseInt(storeId),
    },
  });

  const formattedBillboards: BillboardColumn[] = billboards.map(
    (item: BillboardColumn) => ({
      id: item.id,
      label: item.label,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    })
  );

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient billboards={formattedBillboards} />
      </div>
    </div>
  );
};

export default BillboardsPage;
