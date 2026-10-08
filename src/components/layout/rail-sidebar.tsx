"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Box,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resources", href: "/dashboard/resources", icon: Box },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function RailSidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-full md:w-[180px] shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-line)] p-6 flex flex-col justify-between md:h-screen md:sticky md:top-0 bg-[var(--bg-canvas)]">
      <div>
        <div className="mb-8">
          <Link href="/" className="text-xl font-serif tracking-tight font-medium">
            parabox
          </Link>
          <span className="block text-[11px] text-[var(--ink-muted)] mt-0.5">
            app foundation
          </span>
        </div>

        <nav className="flex md:flex-col gap-1 text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm transition-colors ${
                  isActive
                    ? "font-medium text-[var(--ink-primary)] bg-[var(--bg-subtle)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-6 border-t border-[var(--border-line)] flex md:flex-col justify-between items-start gap-4">
        {userEmail && (
          <div className="text-xs truncate max-w-[140px] text-[var(--ink-muted)]" title={userEmail}>
            {userEmail}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-[var(--ink-muted)] hover:text-[var(--status-error)] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
