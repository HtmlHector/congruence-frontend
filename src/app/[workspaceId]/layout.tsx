import { WorkspaceBinder } from "./workspace-binder";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <WorkspaceBinder workspaceId={workspaceId} />
      {children}
    </div>
  );
}
