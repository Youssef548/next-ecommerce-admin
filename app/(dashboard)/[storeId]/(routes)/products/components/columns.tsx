"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cellAction";
import { Badge } from "@/components/ui/badge";

// Updated type to handle multiple relationships
export type ProductColumn = {
  id: string;
  name: string;
  price: string;
  categories: Array<{ id: number; label: string }>;
  sizes: Array<{ id: number; name: string; value: string }>;
  colors: Array<{ id: number; name: string; value: string }>;
  isFeatured: boolean;
  isArchived: boolean;
  createdAt: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.categories.length > 0 ? (
          row.original.categories.map((category) => (
            <Badge key={category.id} variant="secondary" className="text-xs">
              {category.label}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">No categories</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "sizes",
    header: "Sizes",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.sizes.length > 0 ? (
          row.original.sizes.map((size) => (
            <Badge key={size.id} variant="outline" className="text-xs">
              {size.name} ({size.value})
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">No sizes</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "colors",
    header: "Colors",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.colors.length > 0 ? (
          row.original.colors.map((color) => (
            <Badge key={color.id} variant="outline" className="flex items-center gap-1 text-xs">
              <div
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: color.value }}
              />
              {color.name}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">No colors</span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
