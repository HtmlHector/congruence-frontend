import { redirect } from "next/navigation";

export default async function DynamicWorkspaceRedirectPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  redirect(`/${workspaceId}`);
}
