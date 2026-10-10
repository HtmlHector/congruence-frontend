import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Blocks } from "lucide-react";
import { IntegrationsHubView } from "@/features/integrations/components/integrations-hub-view";

export const metadata: Metadata = {
  title: "Integrations Hub | Parabox",
  description: "Manage connected services, OAuth providers, and webhook configurations.",
};

interface IntegrationsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function IntegrationsPage({ params }: IntegrationsPageProps) {
  const { workspaceId } = await params;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href={`/${workspaceId}`}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Workspace
            </Link>
            <span>/</span>
            <span className="text-foreground">Integrations</span>
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <Blocks className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Integrations & Services
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect third-party OAuth platforms, configure webhook receiver secrets, and manage workspace tokens.
          </p>
        </div>
      </div>

      <IntegrationsHubView workspaceId={workspaceId} />
    </div>
  );
}
