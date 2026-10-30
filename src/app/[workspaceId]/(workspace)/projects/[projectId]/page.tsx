import { Metadata } from "next";

import { ProjectDetailView } from "@/features/projects/components/project-detail-view";

export const metadata: Metadata = {
  title: "Project | Congruence",
  description: "Worktrees and their agent workspaces.",
};

interface ProjectPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { workspaceId, projectId } = await params;

  return <ProjectDetailView workspaceId={workspaceId} projectId={projectId} />;
}
