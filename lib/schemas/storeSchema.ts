import * as z from "zod";

export const updateStoreSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});

export type UpdateStoreForm = z.infer<typeof updateStoreSchema>;
