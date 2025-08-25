"use client";

import { useOrigin } from "@/app/hooks/useOrigin";
import { AlertModal } from "@/components/modals/alertModal";
import { ApiAlert } from "@/components/ui/api-alert";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api/axiosInstance";
import { handleApiError } from "@/lib/handle-api-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Size } from "@prisma/client";
import { Trash as TrashIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

// Create a schema for size form
const sizeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  storeId: z.string().min(1, "StoreId is required"),
});

type SizeFormValues = z.infer<typeof sizeSchema>;

interface SizeFormProps {
  initialData: Size | null;
}

export const SizeForm = ({ initialData }: SizeFormProps) => {
  const params = useParams();
  const router = useRouter();

  const origin = useOrigin();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const title = initialData ? "Edit Size" : "Create Size";
  const description = initialData ? "Edit a size" : "Add a new size";
  const toastMessage = initialData ? "Size updated." : "Size created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<SizeFormValues>({
    resolver: zodResolver(sizeSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          value: initialData.value,
          storeId: String(initialData.storeId),
        }
      : {
          name: "",
          value: "",
          storeId: String(params.storeId),
        },
  });
  const onSubmit: SubmitHandler<SizeFormValues> = async (data) => {
    try {
      setIsLoading(true);

      if (initialData) {
        // Update existing size
        await api.patch(`${params.storeId}/sizes/${params.sizeId}`, data);
      } else {
        // Create new size
        await api.post(`${params.storeId}/sizes`, data);
      }

      router.push(`/${params.storeId}/sizes`);
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

      await api.delete(`/${params.storeId}/sizes/${params.sizeId}`);

      router.push(`/${params.storeId}/sizes`);
      router.refresh();
      toast.success("Size deleted successfully");
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
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
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Size name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Size value"
                      {...field}
                    />
                  </FormControl>
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
            description={`${origin}/api/${params.storeId}/sizes`}
            variant="public"
          />
        </>
      )}
    </>
  );
};
