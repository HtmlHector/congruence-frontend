import { WorkspaceSidebar } from "../workspace-sidebar";

export default async function WorkspaceShellLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <>
      <WorkspaceSidebar workspaceId={workspaceId} />
      {/* The offset tracks the sidebar's live width, which the sidebar sets from
          the user's resize and collapse preference. */}
      <div className="workspace-shell-offset flex h-[calc(100svh_-_3.5rem)] flex-col overflow-hidden bg-foundation-surface lg:h-svh lg:pl-[var(--workspace-sidebar-width,260px)]">
        {children}
      </div>
    </>
  );
}
