import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

export function handleApiError(error: unknown) {
  if (error instanceof AxiosError) {
    toast.error(error.response?.data?.error || "Something went wrong");
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("Something went wrong");
  }
}
