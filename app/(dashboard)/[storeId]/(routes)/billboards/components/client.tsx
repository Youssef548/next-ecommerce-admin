"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { BillboardColumn, columns } from "./columns";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";

const ApiList = dynamic(() => import("@/components/ui/api-list"), {
  ssr: false,
  loading: () => <p>Loading ApiList...</p>,
});

const DataTable = dynamic<{
  columns: ColumnDef<BillboardColumn>[];
  data: BillboardColumn[];
  searchKey: string;
}>(() => import("@/components/ui/data-table").then((m) => m.DataTable), {
  ssr: false,
  loading: () => (
    <div className="rounded-md border">
      <div className="p-4">
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  ),
});

interface BillboardsClientProps {
  billboards: BillboardColumn[];
}

const BillboardClient = ({ billboards }: BillboardsClientProps) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Billboards (${billboards.length})`}
          description="Manage billboards for your store"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/billboards/new`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={columns} 
        data={billboards} 
        searchKey="label" 
      />
      <Heading title="API" description="API calls for Billboards" />
      <Separator />
      <ApiList entityName="billboards" entityIdName="billboardId" />
    </>
  );
};

export { BillboardClient };
export default BillboardClient;
