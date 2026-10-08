"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  PanelLeft,
  Search,
  Settings as GeneralIcon,
  Sun,
  Bell,
  User,
  Shield,
  CreditCard,
  KeyRound,
  Users,
  GitBranch,
  Folder,
  Sliders,
  Server,
  Activity,
  Cpu,
  Sparkles,
  Github,
  Cloud,
  Lock,
  ExternalLink,
  ChevronRight,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  Mail,
  UserPlus,
  MoreHorizontal,
  Edit3,
} from "lucide-react";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Tab types
type SettingsTabId =
  | "general"
  | "appearance"
  | "security"
  | "account"
  | "storage"
  | "usage"
  | "billing"
  | "datacontrols"
  | "harnesses"
  | "github"
  | "cloud"
  | "environment"
  | "team";

interface NavItem {
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isExternal?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface EnvVar {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  isVisible: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Writer" | "Watcher";
  hasLease: boolean;
  avatarColor: string;
}

function SettingsLayoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as SettingsTabId) || "billing";

  const { project, projectId, hostState } = useWorkspace();

  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync tab with URL
  const handleSelectTab = (tabId: SettingsTabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tabId);
    router.replace(`/settings?${params.toString()}`);
  };

  // 1. General State
  const [projectName, setProjectName] = useState(project?.name || "congruence-frontend");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // 2. Env Vars State
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { id: "e1", key: "ANTHROPIC_API_KEY", value: "sk-ant-api03-9df82f91a0c9e83b", isSecret: true, isVisible: false },
    { id: "e2", key: "OPENAI_API_KEY", value: "sk-proj-49a029fe871b0c93a", isSecret: true, isVisible: false },
    { id: "e3", key: "DATABASE_URL", value: "postgresql://postgres:pass@db.internal:5432/congruence", isSecret: true, isVisible: false },
    { id: "e4", key: "NEXT_PUBLIC_APP_ENV", value: "production", isSecret: false, isVisible: true },
    { id: "e5", key: "PORT", value: "3000", isSecret: false, isVisible: true },
  ]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newIsSecret, setNewIsSecret] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSavingEnv, setIsSavingEnv] = useState(false);

  // 3. Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "tm-1", name: "Hector (You)", email: "trashdev098@gmail.com", role: "Owner", hasLease: true, avatarColor: "bg-[#52a447]" },
    { id: "tm-2", name: "Sarah Chen", email: "sarah@congruence.dev", role: "Writer", hasLease: true, avatarColor: "bg-[#3b82f6]" },
    { id: "tm-3", name: "Alex Miller", email: "alex.m@productlead.io", role: "Watcher", hasLease: false, avatarColor: "bg-[#8b5cf6]" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Writer" | "Watcher">("Writer");
  const [isInviting, setIsInviting] = useState(false);

  // 4. Billing State
  const [writerSeats, setWriterSeats] = useState(2);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  useEffect(() => {
    if (project?.name) {
      setProjectName(project.name);
    }
  }, [project]);

  // Navigation Items matching the screenshot structure
  const navSections: NavSection[] = [
    {
      title: "Workspace & Personal",
      items: [
        { id: "general", label: "General", icon: GeneralIcon },
        { id: "appearance", label: "Appearance", icon: Sun },
        { id: "environment", label: "Environment & Secrets", icon: KeyRound },
        { id: "team", label: "Team & Leases", icon: Users },
        { id: "security", label: "Security and login", icon: Shield },
        { id: "storage", label: "Storage & Lanes", icon: Folder },
        { id: "usage", label: "Usage", icon: Activity },
        { id: "billing", label: "Billing", icon: CreditCard },
        { id: "datacontrols", label: "Data controls", icon: Sliders },
      ],
    },
    {
      title: "Integrations",
      items: [
        { id: "harnesses", label: "Harnesses & CLIs", icon: Sparkles },
        { id: "github", label: "GitHub App", icon: Github },
        { id: "cloud", label: "Cloud compute (Sprite)", icon: Cloud },
      ],
    },
  ];

  // Filtered navigation based on search input
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections;
    const q = searchQuery.toLowerCase();
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.label.toLowerCase().includes(q)),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery]);

  // Handlers
  const handleSaveGeneral = async () => {
    setIsSavingGeneral(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      toast.success("Workspace settings updated.");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleAddEnv = () => {
    if (!newKey.trim()) {
      toast.error("Key cannot be empty");
      return;
    }
    const cleanKey = newKey.trim().toUpperCase().replace(/\s+/g, "_");
    setEnvVars((prev) => [
      ...prev,
      { id: `e-${Date.now()}`, key: cleanKey, value: newValue.trim(), isSecret: newIsSecret, isVisible: !newIsSecret },
    ]);
    setNewKey("");
    setNewValue("");
    setNewIsSecret(true);
    toast.success(`Added ${cleanKey}`);
  };

  const handleCopyEnv = (k: string, v: string) => {
    navigator.clipboard.writeText(v);
    setCopiedKey(k);
    toast.success(`Copied ${k}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveEnv = async () => {
    setIsSavingEnv(true);
    try {
      if (projectId) {
        const anthropicVar = envVars.find((e) => e.key === "ANTHROPIC_API_KEY");
        const openaiVar = envVars.find((e) => e.key === "OPENAI_API_KEY");
        if (anthropicVar?.value || openaiVar?.value) {
          await api.saveVaultKeys(projectId, {
            anthropic_api_key: anthropicVar?.value,
            openai_api_key: openaiVar?.value,
          });
        }
      }
      await new Promise((res) => setTimeout(res, 500));
      toast.success("Environment encrypted & written to /home/user/.env");
    } finally {
      setIsSavingEnv(false);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsInviting(true);
    setTimeout(() => {
      setTeamMembers((prev) => [
        ...prev,
        {
          id: `tm-${Date.now()}`,
          name: inviteEmail.split("@")[0],
          email: inviteEmail.trim(),
          role: inviteRole,
          hasLease: inviteRole === "Writer",
          avatarColor: "bg-[#ec4899]",
        },
      ]);
      if (inviteRole === "Writer") setWriterSeats((s) => s + 1);
      setInviteEmail("");
      setIsInviting(false);
      toast.success(`Invitation sent to ${inviteEmail}`);
    }, 400);
  };

  const handleToggleLease = (id: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newHasLease = !m.hasLease;
          const newRole = newHasLease ? "Writer" : "Watcher";
          toast.success(newHasLease ? `Granted write lease to ${m.name}` : `Revoked write lease from ${m.name}`);
          return { ...m, hasLease: newHasLease, role: newRole as any };
        }
        return m;
      })
    );
  };

  const handleOpenBillingPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank");
          return;
        }
      }
      toast.info("Opening Stripe customer billing portal...");
      setTimeout(() => {
        window.open("https://billing.stripe.com", "_blank");
      }, 600);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] font-sans antialiased flex">
      {/* LEFT SIDEBAR (Matching OpenAI / ChatGPT Settings Sidebar) */}
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-[260px]"
        } shrink-0 border-r border-[var(--border)] bg-[var(--surface-sidebar)] p-3 flex flex-col justify-between transition-all duration-200 select-none min-h-screen sticky top-0`}
      >
        <div className="space-y-4">
          {/* Top Actions: Collapse Icon & Back Button */}
          <div className="flex items-center gap-2 px-1">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--wash)] transition-colors cursor-pointer"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft className="size-4" />
            </button>

            {!sidebarCollapsed && (
              <Link
                href="/workspace"
                className="flex items-center gap-2 text-[13px] font-medium text-[var(--foreground)] hover:text-[var(--foreground-strong)] transition-colors p-1.5 rounded-lg hover:bg-[var(--wash)] -ml-1"
              >
                <ArrowLeft className="size-4 text-[var(--muted-foreground)]" />
                <span>Back</span>
              </Link>
            )}
          </div>

          {/* Search Bar */}
          {!sidebarCollapsed && (
            <div className="relative px-1">
              <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-[var(--wash)] border border-transparent focus:border-[var(--border)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Navigation Sections & Links */}
          <div className="space-y-6 pt-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {filteredSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-2.5 pb-1 text-[11px] font-medium text-[var(--muted-foreground)]">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[var(--wash-strong)] text-[var(--foreground)] font-medium"
                          : "text-[var(--foreground)] hover:bg-[var(--wash)]"
                      } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="size-4 shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.isExternal && (
                        <ExternalLink className="size-3 text-[var(--muted-foreground)] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Indicator */}
        {!sidebarCollapsed && (
          <div className="pt-3 border-t border-[var(--border)] px-1 flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#52a447] text-white font-medium text-xs select-none">
              H
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-[var(--foreground)] truncate">Hector</div>
              <div className="text-[11px] text-[var(--muted-foreground)] truncate">trashdev098@gmail.com</div>
            </div>
          </div>
        )}
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 p-8 sm:p-12 lg:px-16 max-w-5xl overflow-y-auto">
        {/* TAB 1: BILLING (Matches the uploaded reference screenshot layout) */}
        {activeTab === "billing" && (
          <div className="space-y-8 max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Billing</h1>

            {/* Section 1: Current Plan Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 flex items-center justify-between shadow-xs">
              <div>
                <div className="font-medium text-[15px] text-[var(--foreground)]">Congruence Team Pro</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Multi-agent worktrees, live reverse-proxy preview & unlimited observers
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenBillingPortal}
                disabled={isLoadingPortal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--wash-strong)] hover:bg-[var(--wash)] text-[var(--foreground)] text-xs font-medium border border-[var(--border)] transition-colors cursor-pointer"
              >
                <Sparkles className="size-3.5 text-blue-500" />
                <span>Upgrade / Manage</span>
              </button>
            </div>

            {/* Section 2: Balance */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--foreground)]">Balance</h2>
                <button
                  type="button"
                  onClick={() => toast.info("No voucher code active")}
                  className="px-3 py-1.5 rounded-full bg-[var(--wash)] hover:bg-[var(--wash-strong)] text-[var(--foreground)] text-xs font-medium transition-colors cursor-pointer"
                >
                  Redeem gift card
                </button>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 space-y-2">
                <div className="text-lg font-mono font-medium text-[var(--foreground)]">$0.00</div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Your balance includes redeemed team promo credits and compute adjustments. It is automatically applied to eligible subscription invoices.{" "}
                  <a href="#" className="underline hover:text-[var(--foreground)]">Learn more</a>
                </p>
              </div>
            </div>

            {/* Section 3: Transaction history */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-[var(--foreground)]">Transaction history</h2>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] overflow-hidden divide-y divide-[var(--border)]">
                {[
                  { desc: "Congruence Pro (2 Writers)", date: "10/01/2026", status: "Paid", amount: "$98.00" },
                  { desc: "Congruence Pro (2 Writers)", date: "09/01/2026", status: "Paid", amount: "$98.00" },
                  { desc: "Congruence Pro (1 Writer)", date: "08/01/2026", status: "Paid", amount: "$49.00" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 text-[13px] hover:bg-[var(--wash-subtle)] transition-colors cursor-pointer"
                    onClick={() => toast.success(`Receipt for ${item.date} downloaded`)}
                  >
                    <span className="font-normal text-[var(--foreground)]">{item.desc}</span>
                    <span className="font-mono text-[12px] text-[var(--muted-foreground)]">{item.date}</span>
                    <span className="text-[11px] font-medium text-[#52a447] bg-[#52a447]/10 px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-[var(--foreground)]">{item.amount}</span>
                      <ChevronRight className="size-4 text-[var(--muted-foreground)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Billing information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--foreground)]">Billing information</h2>
                <button
                  type="button"
                  onClick={handleOpenBillingPortal}
                  className="px-3.5 py-1.5 rounded-full bg-[var(--wash)] hover:bg-[var(--wash-strong)] text-[var(--foreground)] text-xs font-medium transition-colors cursor-pointer"
                >
                  Edit
                </button>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 space-y-4 text-[13px]">
                <div>
                  <div className="text-xs font-medium text-[var(--muted-foreground)]">Billing email</div>
                  <div className="text-[var(--foreground)] mt-0.5 font-normal">trashdev098@gmail.com</div>
                </div>
                <div className="border-t border-[var(--border)] pt-3">
                  <div className="text-xs font-medium text-[var(--muted-foreground)]">Name</div>
                  <div className="text-[var(--foreground)] mt-0.5 font-normal">Hector</div>
                </div>
                <div className="border-t border-[var(--border)] pt-3">
                  <div className="text-xs font-medium text-[var(--muted-foreground)]">Billing address</div>
                  <div className="text-[var(--foreground)] mt-0.5 leading-snug">
                    2885 Bronx<br />
                    Bronx, NY, 10458<br />
                    United States
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Payment methods */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--foreground)]">Payment methods</h2>
                <button
                  type="button"
                  onClick={handleOpenBillingPortal}
                  className="px-3.5 py-1.5 rounded-full bg-[var(--wash)] hover:bg-[var(--wash-strong)] text-[var(--foreground)] text-xs font-medium transition-colors cursor-pointer"
                >
                  Add new
                </button>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-4 flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-3">
                  <CreditCard className="size-5 text-[var(--muted-foreground)]" />
                  <div>
                    <div className="font-medium text-[var(--foreground)]">Discover</div>
                    <div className="text-xs text-[var(--muted-foreground)] font-mono">•••• 2798</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenBillingPortal}
                  className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--wash)] cursor-pointer"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GENERAL */}
        {activeTab === "general" && (
          <div className="space-y-8 max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">General</h1>

            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--foreground)]">Workspace Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--foreground)]">Linked GitHub Repository</label>
                  <div className="flex items-center justify-between h-10 px-3.5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border)] text-sm text-[var(--foreground)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Github className="size-4 text-[var(--muted-foreground)]" />
                      <span className="truncate font-mono text-xs text-[var(--foreground)]">
                        {project?.repo_url || `https://github.com/${project?.repo_full_name || "congruence-dev/congruence-frontend"}`}
                      </span>
                    </div>
                    <a
                      href={project?.repo_url || "https://github.com"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--foreground)]">Default Base Branch</label>
                    <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border)] text-xs text-[var(--foreground)]">
                      <GitBranch className="size-3.5 text-[var(--muted-foreground)]" />
                      <input
                        type="text"
                        value={defaultBranch}
                        onChange={(e) => setDefaultBranch(e.target.value)}
                        className="w-full bg-transparent focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--foreground)]">Host Status</label>
                    <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)]">
                      <span
                        className={`size-2 rounded-full ${
                          hostState === "awake" ? "bg-[#52a447] animate-pulse" : "bg-amber-500"
                        }`}
                      />
                      <span className="capitalize">{hostState} (Fly Sprite microVM)</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={handleSaveGeneral}
                    disabled={isSavingGeneral}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {isSavingGeneral ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-medium text-sm">
                  <AlertTriangle className="size-4" />
                  <span>Delete Workspace</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Permanently remove this workspace, erase the host runner NVMe microVM storage, and revoke all active lane leases.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this workspace?")) {
                        toast.error("Workspace deletion requested.");
                      }
                    }}
                    className="px-4 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Delete Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ENVIRONMENT & SECRETS */}
        {activeTab === "environment" && (
          <div className="space-y-8 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Environment & Secrets</h1>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Injected into the runner host microVM (`/home/user/.env`).
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveEnv}
                disabled={isSavingEnv}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                {isSavingEnv ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                <span>Save & Deploy</span>
              </button>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 space-y-3">
              {envVars.map((env) => (
                <div
                  key={env.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border)] text-xs"
                >
                  <div className="w-1/3 min-w-0 font-mono font-medium text-[var(--foreground)] truncate">
                    {env.key}
                  </div>
                  <div className="flex-1 min-w-0 font-mono text-[var(--muted-foreground)] truncate">
                    {env.isSecret && !env.isVisible ? "••••••••••••••••••••••••" : env.value}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {env.isSecret && (
                      <button
                        type="button"
                        onClick={() =>
                          setEnvVars((prev) =>
                            prev.map((e) => (e.id === env.id ? { ...e, isVisible: !e.isVisible } : e))
                          )
                        }
                        className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--wash)] cursor-pointer"
                      >
                        {env.isVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopyEnv(env.key, env.value)}
                      className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--wash)] cursor-pointer"
                    >
                      {copiedKey === env.key ? <Check className="size-3.5 text-[#52a447]" /> : <Copy className="size-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnvVars((prev) => prev.filter((e) => e.id !== env.id))}
                      className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add row */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2">
                <input
                  type="text"
                  placeholder="KEY"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-1/3 h-9 px-3 rounded-lg bg-[var(--surface-primary)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)]"
                />
                <input
                  type="text"
                  placeholder="VALUE"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg bg-[var(--surface-primary)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)]"
                />
                <button
                  type="button"
                  onClick={handleAddEnv}
                  className="flex items-center gap-1 h-9 px-4 rounded-full bg-[var(--wash-strong)] hover:bg-[var(--wash)] text-[var(--foreground)] text-xs font-medium cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TEAM & LEASES */}
        {activeTab === "team" && (
          <div className="space-y-8 max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Team & Leases</h1>

            <form onSubmit={handleInvite} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-4">
              <div className="flex-1 flex items-center gap-2 h-10 px-3.5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border)] text-xs">
                <Mail className="size-4 text-[var(--muted-foreground)]" />
                <input
                  type="email"
                  placeholder="teammate@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="h-10 px-3 rounded-xl bg-[var(--surface-primary)] border border-[var(--border)] text-xs text-[var(--foreground)]"
              >
                <option value="Writer">Writer ($49/mo)</option>
                <option value="Watcher">Watcher (Free)</option>
              </select>
              <button
                type="submit"
                disabled={isInviting}
                className="px-5 py-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-xs font-medium hover:opacity-90 cursor-pointer"
              >
                Invite
              </button>
            </form>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 space-y-3">
              <div className="text-xs font-medium text-[var(--muted-foreground)] pb-1">Members ({teamMembers.length})</div>
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-primary)] border border-[var(--border)] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-7 rounded-full flex items-center justify-center text-white font-medium ${member.avatarColor}`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--foreground)]">{member.name}</div>
                      <div className="text-[11px] text-[var(--muted-foreground)]">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-[var(--border)] text-[var(--muted-foreground)]">
                      {member.role}
                    </span>
                    {member.role !== "Owner" && (
                      <button
                        type="button"
                        onClick={() => handleToggleLease(member.id)}
                        className="px-3 py-1 rounded-full bg-[var(--wash)] hover:bg-[var(--wash-strong)] text-[11px] font-medium text-[var(--foreground)] cursor-pointer"
                      >
                        {member.hasLease ? "Revoke Lease" : "Grant Write Lease"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {!["billing", "general", "environment", "team"].includes(activeTab) && (
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] capitalize">
              {activeTab.replace(/([A-Z])/g, " $1")}
            </h1>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-8 text-center text-xs text-[var(--muted-foreground)]">
              Configuration options for {activeTab} are active and managed via host custody.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <WorkspaceProvider>
      <Suspense fallback={<div className="p-12 text-xs text-[var(--muted-foreground)]">Loading settings...</div>}>
        <SettingsLayoutContent />
      </Suspense>
    </WorkspaceProvider>
  );
}
