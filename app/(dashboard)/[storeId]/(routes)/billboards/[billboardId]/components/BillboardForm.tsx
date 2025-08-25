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
import ImageUpload from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api/axiosInstance";
import { handleApiError } from "@/lib/handle-api-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Billboard } from "@prisma/client";
import { Trash as TrashIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
// import { ImageUpload } from "@/components/ui/image-upload";

// Create a schema for billboard form
const billboardSchema = z.object({
  label: z.string().min(1, "Label is required"),
  imageUrl: z.string().min(1, "Image is required"),
});

type BillboardFormValues = z.infer<typeof billboardSchema>;

interface BillboardFormProps {
  initialData: Billboard | null;
}

export const BillboardForm = ({ initialData }: BillboardFormProps) => {
  const params = useParams();
  const router = useRouter();

  const origin = useOrigin();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const title = initialData ? "Edit Billboard" : "Create Billboard";
  const description = initialData ? "Edit a billboard" : "Add a new billboard";
  const toastMessage = initialData
    ? "Billboard updated."
    : "Billboard created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(billboardSchema),
    defaultValues: initialData
      ? {
          label: initialData.label,
          imageUrl: initialData.imageUrl,
        }
      : {
          label: "",
          imageUrl: "",
        },
  });
  console.log(params);
  const onSubmit: SubmitHandler<BillboardFormValues> = async (data) => {
    try {
      setIsLoading(true);

      if (initialData) {
        // Update existing billboard

        await api.patch(
          `${params.storeId}/billboards/${params.billboardId}`,
          data
        );
      } else {
        // Create new billboard
        await api.post(`${params.storeId}/billboards`, data);
      }

      router.push(`/${params.storeId}/billboards`);
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

      await api.delete(
        `/${params.storeId}/billboards/${params.billboardId}`
      );

      router.push(`/${params.storeId}/billboards`);
      router.refresh();
      toast.success("Billboard deleted successfully");
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
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={isLoading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Billboard label"
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
            description={`${origin}/api/${params.storeId}/billboards`}
            variant="public"
          />
        </>
      )}
    </>
  );
};
