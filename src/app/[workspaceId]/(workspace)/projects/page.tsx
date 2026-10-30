import { Metadata } from "next";

import { ProjectsView } from "@/features/projects/components/projects-view";

export const metadata: Metadata = {
  title: "Projects | Congruence",
  description:
    "Persistent cloud devboxes with worktrees, terminals, and coding agents.",
};

interface ProjectsPageProps {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ new?: string }>;
}

export default async function ProjectsPage({
  params,
  searchParams,
}: ProjectsPageProps) {
  const { workspaceId } = await params;
  const { new: newProject } = await searchParams;

  return (
    <ProjectsView workspaceId={workspaceId} initialCreateOpen={newProject === "1"} />
  );
}
