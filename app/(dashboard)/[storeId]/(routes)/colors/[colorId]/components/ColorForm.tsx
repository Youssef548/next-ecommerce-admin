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
import { zodResolver } from "@hookform/resolvers/zod";
import { Color } from "@prisma/client";
import { Trash as TrashIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

// Create a schema for color form
const colorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z
    .string()
    .min(4, "Value is required")
    .regex(/^#/, { message: "Value must be a valid hex color code" }),
  storeId: z.string().min(1, "StoreId is required"),
});

type ColorFormValues = z.infer<typeof colorSchema>;

interface ColorFormProps {
  initialData: Color | null;
}

export const ColorForm = ({ initialData }: ColorFormProps) => {
  console.log(initialData);
  const params = useParams();
  const router = useRouter();

  const origin = useOrigin();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const title = initialData ? "Edit Color" : "Create Color";
  const description = initialData ? "Edit a color" : "Add a new color";
  const toastMessage = initialData ? "Color updated." : "Color created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(colorSchema),
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
  const onSubmit: SubmitHandler<ColorFormValues> = async (data) => {
    try {
      setIsLoading(true);

      if (initialData) {
        // Update existing color
        await api.patch(`${params.storeId}/colors/${params.colorId}`, data);
      } else {
        // Create new color
        await api.post(`${params.storeId}/colors`, data);
      }

      router.push(`/${params.storeId}/colors`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);

      await api.delete(`/${params.storeId}/colors/${params.colorId}`);

      router.push(`/${params.storeId}/colors`);
      router.refresh();
      toast.success("Color deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Something went wrong");
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
                      placeholder="Color name"
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
                    <div className="flex items-center gap-x-4">
                      <Input
                        disabled={isLoading}
                        placeholder="Color value"
                        {...field}
                      />
                      <div
                        className="p-4 rounded-full border"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
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
            description={`${origin}/api/${params.storeId}/colors`}
            variant="public"
          />
        </>
      )}
    </>
  );
};
