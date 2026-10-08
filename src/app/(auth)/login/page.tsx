import { AuthLayout } from "@/components/auth/AuthLayout";

export const metadata = {
  title: "Sign in · Congruence",
  description: "Sign in to access your agent worktrees and live preview.",
};

export default function LoginPage() {
  return <AuthLayout mode="sign-in" />;
}
