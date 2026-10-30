import { SettingsSidebar } from "./settings-sidebar";

export default async function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <div className="min-h-svh bg-foundation-bg text-foundation-ink">
      <SettingsSidebar workspaceId={workspaceId} />

      <div className="lg:pl-[264px]">
        <main className="min-h-[calc(100svh-3rem)] bg-foundation-surface lg:min-h-svh lg:border-l lg:border-foundation-line">
          <div className="mx-auto w-full max-w-[1120px] px-5 pt-8 pb-16 sm:px-8 lg:mx-0 lg:px-12 lg:pt-14 lg:pb-24 xl:px-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
