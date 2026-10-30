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
    <div className="min-h-svh bg-foundation-bg text-foundation-ink">
      <WorkspaceBinder workspaceId={workspaceId} />
      {children}
    </div>
  );
}
