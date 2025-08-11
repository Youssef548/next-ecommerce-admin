"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";

import { OrderColumn, columns } from "./columns";

const DataTable = dynamic<{
  columns: ColumnDef<OrderColumn>[];
  data: OrderColumn[];
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

interface OrdersClientProps {
  orders: OrderColumn[];
}

export const OrderClient = ({ orders }: OrdersClientProps) => {
  return (
    <>
      <Heading
        title={`Orders (${orders.length})`}
        description="Manage orders for your store"
      />
      <Separator />
      <DataTable columns={columns} data={orders} searchKey="products" />
    </>
  );
};
