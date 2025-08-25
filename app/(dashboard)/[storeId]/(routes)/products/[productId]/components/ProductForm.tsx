"use client";

import { useOrigin } from "@/app/hooks/useOrigin";
import { AlertModal } from "@/components/modals/alertModal";
import { ApiAlert } from "@/components/ui/api-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import MultiImageUpload from "@/components/ui/multi-image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api/axiosInstance";
import { handleApiError } from "@/lib/handle-api-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Color, Image, Product, Size } from "@prisma/client";
import { Trash as TrashIcon, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";

// Updated schema for multiple relationships
const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  images: z.array(z.string(), {
    required_error: "Images are required",
  }),
  price: z.coerce.number().min(1, "Price is required"),
  categoryIds: z.array(z.number()).min(1, "At least one category is required"),
  sizeIds: z.array(z.number()).min(1, "At least one size is required"),
  colorIds: z.array(z.number()).min(1, "At least one color is required"),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData:
    | (Product & {
        images: Image[];
        categories?: Array<{ id: number; label: string }>;
        sizes?: Array<{ id: number; name: string; value: string }>;
        colors?: Array<{ id: number; name: string; value: string }>;
      })
    | null;
  categories: Category[];
  sizes: Size[];
  colors: Color[];
}

export const ProductForm = ({ initialData, categories, sizes, colors }: ProductFormProps) => {
  const params = useParams();
  const router = useRouter();

  const origin = useOrigin();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const title = initialData ? "Edit Product" : "Create Product";
  const description = initialData ? "Edit a product" : "Add a new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          images: initialData.images.map((image) => image.url),
          price: parseFloat(String(initialData?.price)),
          categoryIds: initialData.categories?.map(cat => cat.id) || [],
          sizeIds: initialData.sizes?.map(size => size.id) || [],
          colorIds: initialData.colors?.map(color => color.id) || [],
          isFeatured: initialData.isFeatured,
          isArchived: initialData.isArchived,
        }
      : {
          name: "",
          images: [],
          price: 0,
          categoryIds: [],
          sizeIds: [],
          colorIds: [],
          isFeatured: false,
          isArchived: false,
        },
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setIsLoading(true);

      if (initialData) {
        // Update existing product
        await api.patch(`${params.storeId}/products/${params.productId}`, data);
      } else {
        // Create new product
        await api.post(`${params.storeId}/products`, data);
      }

      router.push(`/${params.storeId}/products`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);

      await api.delete(`/${params.storeId}/products/${params.productId}`);

      router.push(`/${params.storeId}/products`);
      router.refresh();
      toast.success("Product deleted successfully");
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for multi-select
  const addToSelection = (
    currentValues: number[],
    newValue: string,
    onChange: (values: number[]) => void
  ) => {
    const numValue = parseInt(newValue);
    if (!currentValues.includes(numValue)) {
      onChange([...currentValues, numValue]);
    }
  };

  const removeFromSelection = (
    currentValues: number[],
    valueToRemove: number,
    onChange: (values: number[]) => void
  ) => {
    onChange(currentValues.filter(id => id !== valueToRemove));
  };

  return (
    <>
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={onDelete}
        isLoading={isLoading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsAlertOpen(true)}
            disabled={isLoading}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <MultiImageUpload
                      value={field.value.flat().map((url) => url)}
                      disabled={isLoading}
                      onChange={(url) =>
                        field.onChange([...(field.value.flat() || []), url])
                      }
                      onRemove={(url) =>
                        field.onChange([
                          ...field.value
                            .flat()
                            .filter((currentUrl) => currentUrl !== url),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Product name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="9.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Multi-select Categories */}
          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories</FormLabel>
                <div className="space-y-4">
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => addToSelection(field.value, value, field.onChange)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Add categories" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories
                        .filter(category => !field.value.includes(category.id))
                        .map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Selected Categories */}
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((categoryId) => {
                      const category = categories.find(c => c.id === categoryId);
                      return category ? (
                        <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                          {category.label}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeFromSelection(field.value, categoryId, field.onChange)}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Multi-select Sizes */}
          <FormField
            control={form.control}
            name="sizeIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sizes</FormLabel>
                <div className="space-y-4">
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => addToSelection(field.value, value, field.onChange)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Add sizes" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes
                        .filter(size => !field.value.includes(size.id))
                        .map((size) => (
                          <SelectItem key={size.id} value={String(size.id)}>
                            {size.name} ({size.value})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Selected Sizes */}
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((sizeId) => {
                      const size = sizes.find(s => s.id === sizeId);
                      return size ? (
                        <Badge key={sizeId} variant="secondary" className="flex items-center gap-1">
                          {size.name} ({size.value})
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeFromSelection(field.value, sizeId, field.onChange)}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Multi-select Colors */}
          <FormField
            control={form.control}
            name="colorIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colors</FormLabel>
                <div className="space-y-4">
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => addToSelection(field.value, value, field.onChange)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Add colors" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors
                        .filter(color => !field.value.includes(color.id))
                        .map((color) => (
                          <SelectItem key={color.id} value={String(color.id)}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border" 
                                style={{ backgroundColor: color.value }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Selected Colors */}
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((colorId) => {
                      const color = colors.find(c => c.id === colorId);
                      return color ? (
                        <Badge key={colorId} variant="secondary" className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full border" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.name}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeFromSelection(field.value, colorId, field.onChange)}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This product will appear on the home page
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Archived</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This product will not appear anywhere in the store
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="ml-auto">
            {action}
          </Button>
        </form>
      </Form>
      {!initialData && (
        <>
          <Separator />
          <ApiAlert
            title="NEXT_PUBLIC_API_URL"
            description={`${origin}/api/${params.storeId}/products`}
            variant="public"
          />
        </>
      )}
    </>
  );
};
