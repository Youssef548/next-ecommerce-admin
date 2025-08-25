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
import { UpdateStoreForm, updateStoreSchema } from "@/lib/schemas/storeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store } from "@prisma/client";
import { Trash as TrashIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface SettingsFormProps {
  initialData: Store;
}

export const SettingsForm = ({ initialData }: SettingsFormProps) => {
  const params = useParams();
  const router = useRouter();

  const origin = useOrigin();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const form = useForm<UpdateStoreForm>({
    resolver: zodResolver(updateStoreSchema),
    defaultValues: {
      name: initialData.name || "",
    },
  });

  const onSubmit: SubmitHandler<UpdateStoreForm> = async (data) => {
    try {
      setIsLoading(true);

      await api.patch(`/stores/${params.storeId}`, data);
      toast.success("Store updated successfully");
      router.refresh();
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);

      await api.delete(`/stores/${params.storeId}`);
      router.refresh();
      router.push("/");
      toast.success("Store deleted successfully");
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={isSettingsOpen}
        onClose={() => closeSettings()}
        onConfirm={() => onDelete()}
        isLoading={isLoading}
      />
      <div className="flex items-center justify-between">
        <Heading title="Settings" description="Manage store preferences" />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsSettingsOpen(true)}
          disabled={isLoading}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
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
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Store name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="ml-auto">
            Save Changes
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        description={`${origin}/api/${params.storeId}`}
        variant="public"
      />
    </>
  );
};
