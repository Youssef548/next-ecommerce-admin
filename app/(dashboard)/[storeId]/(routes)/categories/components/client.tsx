"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { CategoryColumn, columns } from "./columns";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";

const DataTable = dynamic<{
  columns: ColumnDef<CategoryColumn>[];
  data: CategoryColumn[];
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

const ApiList = dynamic(() => import("@/components/ui/api-list"), {
  ssr: false,
  loading: () => (
    <div className="space-y-2">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-6 w-44" />
    </div>
  ),
});

interface CategoriesClientProps {
  categories: CategoryColumn[];
}

export const CategoryClient = ({ categories }: CategoriesClientProps) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Categories (${categories.length})`}
          description="Manage categories for your store"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/categories/new`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={categories} searchKey="name" />
      <Heading title="API" description="API calls for Categories" />
      <Separator />
      <ApiList entityName="categories" entityIdName="categoryId" />
    </>
  );
};
