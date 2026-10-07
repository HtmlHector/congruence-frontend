import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RailSidebar } from "@/components/layout/rail-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // If Supabase credentials are configured and user is missing, redirect to login
  if (supabaseUrl && !supabaseUrl.includes("your-project") && !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-canvas)]">
      <RailSidebar userEmail={user?.email || "developer@parabox.so"} />
      <main className="flex-1 max-w-[820px] p-6 md:p-12">
        {children}
      </main>
    </div>
  );
}
