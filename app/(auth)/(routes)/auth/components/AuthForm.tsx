"use client";

import { useCallback, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../../../components/ui/button";
import AuthSocialButton from "./AuthSocialButton";
import { BsGithub, BsGoogle } from "react-icons/bs";
import { signIn, useSession } from "next-auth/react";

import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type AuthFormVariant = "Login" | "Register";
const registerSchema = z.object({
  name: z.string().min(3, "Name is required").max(50),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export default function AuthForm() {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<AuthFormVariant>("Login");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    setVariant((prev) => (prev === "Login" ? "Register" : "Login"));
  }, [variant]);

  const formSchema = variant === "Register" ? registerSchema : loginSchema;

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);

    try {
      if (variant === "Register") {
        await axios
          .post("/api/register", data)
          .catch(() => toast.error("Registration failed"))
          .finally(() => setIsLoading(false));
      }

      if (variant === "Login") {
        signIn("credentials", {
          ...data,
          redirect: false,
        })
          .then((callback) => {
            if (callback?.error) {
              toast.error("Login failed");
            }

            if (callback?.ok && !callback?.error) {
              toast.success("Login successful");
              router.push("/");
            }
          })
          .finally(() => setIsLoading(false));
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const socialAuth = async (provider: "google" | "github") => {
    // NextAuth SignIn with provider
    setIsLoading(true);

    signIn(provider, {
      redirect: false,
    })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Login failed");
        }

        if (callback?.ok && !callback?.error) {
          toast.success("Login successful");
        }

        setIsLoading(false);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      className="
    mt-8
    sm:mx-auto
    sm:w-full
    sm:max-w-md
    "
    >
      <div
        className="
            bg-white
            px-4
            py-8
            shadow-sm
            sm:rounded-lg
            sm:px-10
            sm:py-12
            "
      >
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {variant === "Register" && (
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="example@gmail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isLoading}
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-6 flex flex-col items-center w-full space-y-4">
                {/* Submit Button */}
                <Button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded shadow-md transition"
                >
                  {variant === "Login" ? "Login" : "Register"}
                </Button>

                {/* OR Divider */}
                <div className="flex items-center justify-center w-full space-x-2 text-gray-500">
                  <hr className="w-1/4 border-gray-300" />
                  <span className="text-sm">Or continue with</span>
                  <hr className="w-1/4 border-gray-300" />
                </div>

                <div className="w-full mt-6 flex gap-2">
                  <AuthSocialButton
                    icon={BsGithub}
                    onClick={() => socialAuth("github")}
                  />

                  <AuthSocialButton
                    icon={BsGoogle}
                    onClick={() => socialAuth("google")}
                  />
                </div>

                <div
                  className="
                mt-6
                gap-2
                flex
                justify-center
                text-sm
                px-2
                text-gray-500
                "
                >
                  <div>
                    {variant === "Login"
                      ? "Are you new user?"
                      : "Already have an account?"}
                  </div>
                  <div
                    onClick={toggleVariant}
                    className="underline cursor-pointer"
                  >
                    {variant === "Login" ? "Create an account" : "Login"}
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
