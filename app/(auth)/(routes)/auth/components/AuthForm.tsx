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
import { loginSchema, registerSchema } from "@/lib/schemas/userSchema";

type AuthFormVariant = "Login" | "Register";

type AuthFormProps = {
  googleEnabled: boolean;
  githubEnabled: boolean;
};

export default function AuthForm({ googleEnabled, githubEnabled }: AuthFormProps) {
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
  }, []);

  type LoginFormData = z.infer<typeof loginSchema>;
  type RegisterFormData = z.infer<typeof registerSchema>;
  type AuthFormData = LoginFormData | RegisterFormData;
  
  const formSchema = variant === "Register" ? registerSchema : loginSchema;

  const form = useForm<AuthFormData>({
    resolver: zodResolver(formSchema), 
  });

  const onSubmit: SubmitHandler<AuthFormData> = async (data) => {
    setIsLoading(true);

    try {
      if (variant === "Register") {
        axios
          .post("/api/register", data)
          .then(() => {
            signIn("credentials", { ...data, redirect: false }).then(
              (callback) => {
                if (callback?.error) {
                  toast.error("Login failed");
                }

                if (callback?.ok && !callback?.error) {
                  toast.success("Login successful");
                  router.push("/");
                }
              }
            );
          })
          .catch((err) => {
            const errorMessage =
              err.response?.data?.message || "Registration failed";
            toast.error(errorMessage);
          })
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
      callbackUrl: "/",
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
      .catch(() => {
        toast.error(`${provider} login is currently unavailable`);
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
            bg-white dark:bg-gray-800
            px-4
            py-8
            shadow-sm
            sm:rounded-lg
            sm:px-10
            sm:py-12
            ">

        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {variant === "Register" && (
                <FormField
                  control={form.control}
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
                <div className="flex items-center justify-center w-full space-x-2 text-gray-500 dark:text-gray-400">
                  <hr className="w-1/4 border-gray-300 dark:border-gray-600" />
                  <span className="text-sm">Or continue with</span>
                  <hr className="w-1/4 border-gray-300 dark:border-gray-600" />
                </div>

                <div className="w-full mt-6 flex gap-2">
                  {githubEnabled && (
                    <AuthSocialButton
                      icon={BsGithub}
                      onClick={() => socialAuth("github")}
                    />
                  )}

                  {googleEnabled && (
                    <AuthSocialButton
                      icon={BsGoogle}
                      onClick={() => socialAuth("google")}
                    />
                  )}
                </div>

                <div
                  className="
                mt-6
                gap-2
                flex
                justify-center
                text-sm
                px-2
                text-gray-500 dark:text-gray-400
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
