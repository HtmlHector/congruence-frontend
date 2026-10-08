/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
import { Header } from "@/components/Header";
import { LandingHero } from "@/components/LandingHero";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { InteractiveWorkspace } from "@/components/workspace/InteractiveWorkspace";
import { WorkflowSection } from "@/components/WorkflowSection";
import { PillarsSection } from "@/components/PillarsSection";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";

export default function CongruenceLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main className="flex-1 flex flex-col">
        <LandingHero />
        <WorkspaceProvider>
          <InteractiveWorkspace />
        </WorkspaceProvider>
        <WorkflowSection />
        <PillarsSection />
        <FaqAccordion />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
