import dynamic from "next/dynamic";

const AuthForm = dynamic(
  () => import("@/app/(auth)/(routes)/auth/components/AuthForm"),
  { ssr: false }
);

export default function AuthPage() {
  return <AuthForm />;
}
