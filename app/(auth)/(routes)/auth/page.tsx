import dynamic from "next/dynamic";

const AuthForm = dynamic(
  () => import("@/app/(auth)/(routes)/auth/components/AuthForm"),
  { ssr: false }
);

import { isGoogleEnabled, isGithubEnabled } from "@/lib/auth-providers";

export default function AuthPage() {
  return <AuthForm 
    googleEnabled={isGoogleEnabled}
    githubEnabled={isGithubEnabled}
  />;
}
