"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { OrderColumn, columns } from "./columns";
import { ApiList } from "@/components/ui/api-list";

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
