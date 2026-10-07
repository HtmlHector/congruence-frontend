"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqAccordion() {
  const faqs = [
    {
      id: "item-1",
      question: "Is this available to use today?",
      answer:
        "This is an interactive product concept. The preview simulates the workflow; it does not provide real hosting, account connections, agent sessions, or GitHub pull requests.",
    },
    {
      id: "item-2",
      question: "Are you building another coding agent?",
      answer:
        "No. The planned product uses existing CLI harnesses and the accounts people already have. It focuses on a shared execution context, rather than a new agent, editor, or hypervisor.",
    },
    {
      id: "item-3",
      question: "What does the first version run on?",
      answer:
        "The proposed control plane uses Vercel, Postgres, a credential vault, and a GitHub App, with a separate WebSocket gateway for live sessions. Fly Sprites is the first planned execution host, with a HostBackend interface that could support Railway and sandbox forks later.",
    },
    {
      id: "item-4",
      question: "What is shared, and what stays private?",
      answer:
        "Service previews are planned to use private-by-default HTTPS access. Each writer gets a worktree, and watching or controlling a lane is a separate permission. The demo's grants and service addresses are simulated.",
    },
  ];

  return (
    <section id="the-details" className="w-full border-t border-[var(--border)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column Description */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-wider block">
              04 / The Details
            </span>
            <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--foreground)]">
              A small product with a clear boundary.
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-normal">
              The first Parabox product connects the pieces of a working environment instead
              of replacing the tools inside it.
            </p>
          </div>

          {/* Right Column Accordion */}
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-2">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-primary)] px-6"
                >
                  <AccordionTrigger className="text-sm font-medium text-[var(--foreground)] hover:no-underline py-5 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed pb-6 pt-1 font-normal">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
