import { AuthLayout } from "@/components/auth/AuthLayout";

export const metadata = {
  title: "Create Account · Congruence",
  description: "Join your shared agent workspace.",
};

export default function SignUpPage() {
  return <AuthLayout mode="sign-up" />;
}
