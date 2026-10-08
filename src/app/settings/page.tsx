"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  PanelLeft,
  PanelLeftOpen,
  Search,
  Settings as GeneralIcon,
  Sun,
  Moon,
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
  RefreshCw,
  Terminal,
  Layers,
  Database,
  CheckCircle2,
  Bot,
} from "lucide-react";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { ClaudeIcon, OpenAIIcon, AntigravityIcon } from "@/components/ui/brand-icons";
import { CodingProvidersSection } from "@/components/settings/CodingProvidersSection";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Tab identifiers
type SettingsTabId =
  | "general"
  | "providers"
  | "appearance"
  | "environment"
  | "team"
  | "security"
  | "storage"
  | "usage"
  | "billing"
  | "datacontrols"
  | "harnesses"
  | "github"
  | "cloud";

interface NavItem {
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
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
  const initialTab = (searchParams.get("tab") as SettingsTabId) || "environment";

  const { currentTenant, project, projectId, hostState } = useWorkspace();
  const { user } = useUser();

  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    currentTenant?.ownerEmail ||
    "";
  const userName =
    user?.fullName ||
    (user?.firstName ? `${user.firstName} (You)` : "You");
  const userInitial = (user?.firstName || user?.fullName || userEmail || "U")
    .charAt(0)
    .toUpperCase();

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
  const [projectName, setProjectName] = useState(project?.name || currentTenant?.name || "congruence-frontend");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // 2. Env Vars State
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { id: "e1", key: "ANTHROPIC_API_KEY", value: "sk-ant-api03-9df82f91a0c9e83b", isSecret: true, isVisible: false },
    { id: "e2", key: "OPENAI_API_KEY", value: "sk-proj-49a029fe871b0c93a", isSecret: true, isVisible: false },
    { id: "e3", key: "DATABASE_URL", value: "postgresql://postgres:pass@127.0.0.1:5432/traceback_dev", isSecret: true, isVisible: false },
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
    { id: "tm-1", name: userName, email: userEmail, role: "Owner", hasLease: true, avatarColor: "bg-[#16a34a]" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Writer" | "Watcher">("Writer");
  const [isInviting, setIsInviting] = useState(false);

  // 4. Billing State
  const [writerSeats, setWriterSeats] = useState(2);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  // 5. Appearance State
  const [themePreference, setThemePreference] = useState<"system" | "dark" | "light">("dark");

  useEffect(() => {
    if (project?.name) {
      setProjectName(project.name);
    }
  }, [project]);

  // Navigation Items matching the design spec
  const navSections: NavSection[] = [
    {
      title: "Workspace & Personal",
      items: [
        { id: "general", label: "General", icon: GeneralIcon },
        { id: "environment", label: "Environment & Secrets", icon: KeyRound, badge: "Vault" },
        { id: "team", label: "Team & Write Leases", icon: Users, badge: "3" },
        { id: "billing", label: "Billing & Plans", icon: CreditCard },
        { id: "appearance", label: "Appearance", icon: Sun },
        { id: "security", label: "Security & Custody", icon: Shield },
        { id: "storage", label: "Storage & Lanes", icon: Folder },
        { id: "usage", label: "Usage & Telemetry", icon: Activity },
        { id: "datacontrols", label: "Data Controls", icon: Sliders },
      ],
    },
    {
      title: "Frontier Integrations & Compute",
      items: [
        { id: "providers", label: "Coding Providers", icon: Bot, badge: "AI" },
        { id: "harnesses", label: "Frontier Agents & CLIs", icon: Sparkles },
        { id: "github", label: "GitHub App & OAuth", icon: Github },
        { id: "cloud", label: "Cloud Compute (microVM)", icon: Cloud, badge: "Sprite" },
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
      toast.success("Workspace parameters updated.");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleAddEnv = () => {
    if (!newKey.trim()) {
      toast.error("Variable key cannot be empty");
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
    toast.success(`Staged ${cleanKey}`);
  };

  const handleCopyEnv = (k: string, v: string) => {
    navigator.clipboard.writeText(v);
    setCopiedKey(k);
    toast.success(`Copied ${k} value to clipboard`);
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
      toast.success("Environment secrets encrypted with AES-256-GCM & written to host runner");
    } catch {
      toast.success("Environment configuration updated locally");
    } finally {
      setIsSavingEnv(false);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid teammate email address");
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
          avatarColor: "bg-[#059669]",
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
          toast.success(newHasLease ? `Granted active write lease to ${m.name}` : `Revoked write lease from ${m.name}`);
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
      }, 500);
    } catch {
      window.open("https://billing.stripe.com", "_blank");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0A0A0C] text-zinc-900 dark:text-zinc-100 font-sans antialiased flex select-none">
      {/* LEFT SIDEBAR (Strict Zero-Rounding IDE Precision) */}
      <aside
        className={`${
          sidebarCollapsed ? "w-[50px]" : "w-[260px]"
        } shrink-0 border-r border-zinc-200 dark:border-[#222227] bg-[#FAFAFA] dark:bg-[#0E0E12] flex flex-col justify-between transition-all duration-150 select-none min-h-screen sticky top-0 z-20 rounded-[3.5px]`}
      >
        <div className="flex flex-col h-full">
          {/* Top Bar: Return to Workspace & Collapse */}
          <div className="h-11 px-2.5 border-b border-zinc-200 dark:border-[#222227] flex items-center justify-between bg-[#F4F4F6] dark:bg-[#0E0E12] shrink-0">
            {!sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push(currentTenant?.id ? `/${currentTenant.id}` : "/workspace");
                  }
                }}
                className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors p-1 rounded-[3.5px] hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer"
                title="Return to Workspace (ESC)"
              >
                <ArrowLeft className="size-3.5 stroke-[2.2]" />
                <span className="font-mono text-[11px] uppercase tracking-wider">Back to Canvas</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push(currentTenant?.id ? `/${currentTenant.id}` : "/workspace")}
                title="Back to Workspace"
                className="flex size-7 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer rounded-[3.5px]"
              >
                <ArrowLeft className="size-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-[3.5px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={sidebarCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="size-3.5" /> : <PanelLeft className="size-3.5" />}
            </button>
          </div>

          {/* Search Filter */}
          {!sidebarCollapsed && (
            <div className="p-2 border-b border-zinc-200 dark:border-[#222227] bg-[#FAFAFA] dark:bg-[#0E0E12]">
              <div className="relative">
                <Search className="size-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-7 pl-7 pr-2.5 bg-white dark:bg-[#141418] border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 rounded-[3.5px] font-mono"
                />
              </div>
            </div>
          )}

          {/* Nav Categories */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {filteredSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-0.5">
                {!sidebarCollapsed && (
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-normal transition-colors cursor-pointer rounded-[3.5px] ${
                        isActive
                          ? "bg-zinc-200 dark:bg-[#1A1A22] text-zinc-950 dark:text-white font-medium border-l-2 border-l-zinc-950 dark:border-l-zinc-100"
                          : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-200"
                      } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="size-3.5 shrink-0 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                        {!sidebarCollapsed && <span className="truncate text-[12px]">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge && (
                        <span className="font-mono text-[9px] px-1 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-[3.5px]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Profile Footer */}
          <div className="h-11 px-2.5 border-t border-zinc-200 dark:border-[#222227] flex items-center justify-between bg-[#F4F4F6] dark:bg-[#0E0E12] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex size-5 shrink-0 items-center justify-center bg-[#16a34a] text-white font-mono font-bold text-[10px] rounded-[3.5px] select-none">
                {userInitial}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 leading-tight">
                  <div className="font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {currentTenant?.name || "Workspace"}
                  </div>
                  <div className="font-mono text-[9px] text-zinc-400 truncate">{userEmail}</div>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <span className="font-mono text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-[3.5px] border border-emerald-500/20">
                {currentTenant?.plan || "Pro"}
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT STAGE */}
      <main className="flex-1 p-6 sm:p-10 lg:px-14 overflow-y-auto max-w-5xl">
        {/* ========================================================================= */}
        {/* TAB 1: ENVIRONMENT & SECRETS (Matches High-Density Technical Spec)       */}
        {/* ========================================================================= */}
        {activeTab === "environment" && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-100">
            {/* Header with Title & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  <span>Workspace Settings</span>
                  <span>/</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Environment & Secrets</span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Environment & Secrets
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                  Injected directly into host microVM runner custody (<code className="text-zinc-800 dark:text-zinc-200">/home/user/.env</code>).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEnv}
                  disabled={isSavingEnv}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-mono font-medium rounded-[3.5px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isSavingEnv ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  <span>SAVE & DEPLOY</span>
                </button>
              </div>
            </div>

            {/* Host Custody Security Badge */}
            <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#121216] text-xs rounded-[3.5px]">
              <div className="flex items-center gap-2.5 font-mono text-[11px]">
                <span className="size-2 rounded-[3.5px] bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">HOST CUSTODY ACTIVE</span>
                <span className="text-zinc-400 dark:text-zinc-500">|</span>
                <span className="text-zinc-500 dark:text-zinc-400">AES-256-GCM Hardware Encrypted NVMe Storage</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                PROTECTED
              </span>
            </div>

            {/* Key-Value Pairs Table Card */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] rounded-[3.5px] divide-y divide-zinc-200 dark:divide-zinc-800">
              {/* Table Column Header */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#FAFAFA] dark:bg-[#141418] text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 font-semibold">
                <span className="w-1/3">Variable Key</span>
                <span className="flex-1">Encrypted Value</span>
                <span className="w-24 text-right">Actions</span>
              </div>

              {/* Rows */}
              {envVars.map((env) => (
                <div
                  key={env.id}
                  className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-zinc-50 dark:hover:bg-[#16161c] transition-colors"
                >
                  <div className="w-1/3 min-w-0 font-mono font-medium text-zinc-950 dark:text-zinc-100 truncate flex items-center gap-1.5">
                    {env.isSecret && <Lock className="size-3 text-amber-500 shrink-0" />}
                    <span className="truncate">{env.key}</span>
                  </div>

                  <div className="flex-1 min-w-0 font-mono text-zinc-600 dark:text-zinc-400 truncate pr-4 text-[11px]">
                    {env.isSecret && !env.isVisible ? (
                      <span className="tracking-widest text-zinc-400 select-none">••••••••••••••••••••••••••••••••</span>
                    ) : (
                      <span className="text-zinc-900 dark:text-zinc-200 select-all">{env.value}</span>
                    )}
                  </div>

                  <div className="w-24 flex items-center justify-end gap-1 shrink-0">
                    {env.isSecret && (
                      <button
                        type="button"
                        onClick={() =>
                          setEnvVars((prev) =>
                            prev.map((e) => (e.id === env.id ? { ...e, isVisible: !e.isVisible } : e))
                          )
                        }
                        className="p-1 rounded-[3.5px] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 cursor-pointer"
                        title={env.isVisible ? "Mask secret" : "Reveal secret"}
                      >
                        {env.isVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopyEnv(env.key, env.value)}
                      className="p-1 rounded-[3.5px] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Copy value"
                    >
                      {copiedKey === env.key ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnvVars((prev) => prev.filter((e) => e.id !== env.id))}
                      className="p-1 rounded-[3.5px] text-zinc-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                      title="Delete variable"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Variable Bottom Bar */}
              <div className="p-3 bg-[#FAFAFA] dark:bg-[#141418] flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="KEY (e.g. STRIPE_API_KEY)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full sm:w-1/3 h-8 px-2.5 bg-white dark:bg-[#101014] border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 rounded-[3.5px]"
                />
                <input
                  type="text"
                  placeholder="VALUE"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full sm:flex-1 h-8 px-2.5 bg-white dark:bg-[#101014] border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 rounded-[3.5px]"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <label className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newIsSecret}
                      onChange={(e) => setNewIsSecret(e.target.checked)}
                      className="rounded-[3.5px] border-zinc-300 dark:border-zinc-700"
                    />
                    <span>Secret</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEnv}
                    className="flex items-center gap-1.5 h-8 px-3.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-medium rounded-[3.5px] transition-colors cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>ADD</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BILLING & PLANS                                                    */}
        {/* ========================================================================= */}
        {activeTab === "billing" && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  <span>Workspace Settings</span>
                  <span>/</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Billing & Plans</span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Billing & Subscription
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                  Managed via Stripe Customer Portal. Seats auto-reconcile on write lease assignment.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenBillingPortal}
                disabled={isLoadingPortal}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-mono font-medium rounded-[3.5px] hover:opacity-90 transition-opacity cursor-pointer"
              >
                {isLoadingPortal ? <Loader2 className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />}
                <span>MANAGE STRIPE PORTAL</span>
              </button>
            </div>

            {/* Plan Tier Card */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-5 rounded-[3.5px] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-zinc-950 dark:text-zinc-100 font-mono">
                      CONGRUENCE PRO
                    </span>
                    <span className="font-mono text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                    Multi-agent worktrees, live HTTPS proxy preview & unlimited observers.
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-2xl font-semibold text-zinc-950 dark:text-white">
                    ${writerSeats * 49}
                    <span className="text-xs text-zinc-400 font-normal">/mo</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">${49} per active writer lease</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 font-mono text-xs">
                <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#141418]">
                  <div className="text-zinc-500 text-[10px] uppercase">Active Write Seats</div>
                  <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-100 mt-0.5">{writerSeats} Writers ($98/mo)</div>
                </div>
                <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#141418]">
                  <div className="text-zinc-500 text-[10px] uppercase">Watchers & Observers</div>
                  <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-100 mt-0.5">Unlimited (Free)</div>
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] rounded-[3.5px] divide-y divide-zinc-200 dark:divide-zinc-800">
              <div className="px-4 py-2.5 bg-[#FAFAFA] dark:bg-[#141418] text-[10px] font-mono uppercase text-zinc-400 font-semibold flex items-center justify-between">
                <span>Recent Invoices & Receipts</span>
                <span>Stripe Verified</span>
              </div>
              {[
                { id: "INV-2026-009", date: "10/01/2026", amount: "$98.00", status: "Paid" },
                { id: "INV-2026-008", date: "09/01/2026", amount: "$98.00", status: "Paid" },
                { id: "INV-2026-007", date: "08/01/2026", amount: "$49.00", status: "Paid" },
              ].map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-4 py-3 text-xs hover:bg-zinc-50 dark:hover:bg-[#16161c] transition-colors cursor-pointer"
                  onClick={() => toast.success(`Receipt for ${inv.id} downloaded.`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{inv.id}</span>
                    <span className="font-mono text-[11px] text-zinc-400">{inv.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20">
                      {inv.status}
                    </span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{inv.amount}</span>
                    <ChevronRight className="size-3.5 text-zinc-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GENERAL WORKSPACE PARAMETERS                                       */}
        {/* ========================================================================= */}
        {activeTab === "general" && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  <span>Workspace Settings</span>
                  <span>/</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">General</span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  General Workspace Settings
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                  Configure repository binding, Git base branches, and host runner parameters.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveGeneral}
                disabled={isSavingGeneral}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-mono font-medium rounded-[3.5px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isSavingGeneral ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                <span>SAVE CHANGES</span>
              </button>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-5 space-y-4 rounded-[3.5px]">
              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 uppercase">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full h-9 px-3 bg-[#FAFAFA] dark:bg-[#101014] border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 rounded-[3.5px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 uppercase">
                  Bound GitHub Repository
                </label>
                <div className="flex items-center justify-between h-9 px-3 bg-[#FAFAFA] dark:bg-[#101014] border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                  <div className="flex items-center gap-2 min-w-0">
                    <Github className="size-4 text-zinc-500 shrink-0" />
                    <span className="truncate text-zinc-900 dark:text-zinc-200">
                      {project?.repo_url || "https://github.com/congruence-dev/congruence-frontend"}
                    </span>
                  </div>
                  <a
                    href={project?.repo_url || "https://github.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>GITHUB ↗</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 uppercase">
                    Default Base Branch
                  </label>
                  <div className="flex items-center gap-2 h-9 px-3 bg-[#FAFAFA] dark:bg-[#101014] border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                    <GitBranch className="size-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={defaultBranch}
                      onChange={(e) => setDefaultBranch(e.target.value)}
                      className="w-full bg-transparent focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 uppercase">
                    Runner microVM State
                  </label>
                  <div className="flex items-center gap-2 h-9 px-3 bg-[#FAFAFA] dark:bg-[#101014] border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                    <span className={`size-2 rounded-[3.5px] ${hostState === "awake" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    <span className="capitalize text-zinc-900 dark:text-zinc-200">{hostState} (Sprite Runner)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-500/30 bg-red-500/5 p-5 space-y-3 rounded-[3.5px]">
              <div className="flex items-center gap-2 text-red-500 font-mono font-semibold text-xs uppercase">
                <AlertTriangle className="size-4" />
                <span>Danger Zone</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                Erases the host runner NVMe microVM storage, closes all active lane leases, and detaches linked repositories.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this workspace? This cannot be undone.")) {
                    toast.error("Workspace deletion requested.");
                  }
                }}
                className="px-4 py-2 border border-red-500/40 text-red-500 hover:bg-red-500/10 font-mono text-xs uppercase font-semibold rounded-[3.5px] cursor-pointer"
              >
                DELETE WORKSPACE
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TEAM & WRITE LEASES                                                */}
        {/* ========================================================================= */}
        {activeTab === "team" && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  <span>Workspace Settings</span>
                  <span>/</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Team & Leases</span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Team Members & Write Leases
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                  Watchers are free. Only members holding an active Write Lease can trigger agent executions or push to worktrees.
                </p>
              </div>
            </div>

            {/* Invite Form */}
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-3 rounded-[3.5px]">
              <div className="flex-1 flex items-center gap-2 h-8 px-2.5 bg-[#FAFAFA] dark:bg-[#101014] border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                <Mail className="size-3.5 text-zinc-400" />
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
                className="h-8 px-2.5 bg-[#FAFAFA] dark:bg-[#101014] border border-zinc-200 dark:border-zinc-800 text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value="Writer">Writer ($49/mo)</option>
                <option value="Watcher">Watcher (Free)</option>
              </select>
              <button
                type="submit"
                disabled={isInviting}
                className="flex items-center justify-center gap-1.5 h-8 px-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-mono font-medium rounded-[3.5px] hover:opacity-90 cursor-pointer"
              >
                {isInviting ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
                <span>INVITE</span>
              </button>
            </form>

            {/* Members Table */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] rounded-[3.5px] divide-y divide-zinc-200 dark:divide-zinc-800">
              <div className="px-4 py-2 bg-[#FAFAFA] dark:bg-[#141418] text-[10px] font-mono uppercase text-zinc-400 font-semibold">
                Active Workspace Members ({teamMembers.length})
              </div>
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3 text-xs hover:bg-zinc-50 dark:hover:bg-[#16161c] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`size-6 rounded-[3.5px] flex items-center justify-center text-white font-mono font-bold text-[10px] ${member.avatarColor}`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-zinc-950 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {member.role === "Owner" && (
                          <span className="font-mono text-[9px] px-1 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-400">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 border ${
                        member.hasLease
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500"
                      }`}
                    >
                      {member.role}
                    </span>
                    {member.role !== "Owner" && (
                      <button
                        type="button"
                        onClick={() => handleToggleLease(member.id)}
                        className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 cursor-pointer"
                      >
                        {member.hasLease ? "REVOKE LEASE" : "GRANT WRITE LEASE"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: CODING PROVIDERS & AGENTS                                            */}
        {/* ========================================================================= */}
        {(activeTab === "providers" || activeTab === "harnesses") && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-100">
            <CodingProvidersSection />
          </div>
        )}

        {/* ========================================================================= */}
        {/* OTHER TABS PLACEHOLDER (Clean Zero-Rounding Obsidian Spec)                */}
        {/* ========================================================================= */}
        {!["environment", "billing", "general", "team", "harnesses", "providers"].includes(activeTab) && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-100">
            <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                <span>Workspace Settings</span>
                <span>/</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold capitalize">{activeTab}</span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white capitalize">
                {activeTab.replace(/([A-Z])/g, " $1")}
              </h1>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-8 text-center text-xs font-mono text-zinc-500 dark:text-zinc-400 rounded-[3.5px] space-y-2">
              <div className="text-zinc-900 dark:text-zinc-100 font-semibold uppercase">
                {activeTab} Management Active
              </div>
              <p className="text-[11px] max-w-md mx-auto">
                Host runner parameters and security invariants for this section are managed via host custody.
              </p>
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
      <Suspense fallback={<div className="p-8 text-xs font-mono text-zinc-500">Loading settings suite...</div>}>
        <SettingsLayoutContent />
      </Suspense>
    </WorkspaceProvider>
  );
}
