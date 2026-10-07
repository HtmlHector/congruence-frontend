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
      question: "Do you run the agent?",
      answer:
        "No. We run the workspace. You bring Claude, Codex, or another CLI and the account behind it. Inference stays on the subscription you already have; we do not resell tokens.",
    },
    {
      id: "item-2",
      question: "Can I use this from a phone?",
      answer:
        "The preview and the terminal are built to work in any modern browser, including on a phone. That is part of the point of moving the execution context off your local laptop.",
    },
    {
      id: "item-3",
      question: "What happens when I close the tab?",
      answer:
        "Files and agent logins stay on persistent disk. Compute may sleep. Opening the workspace again restores your session and, after wake, the live preview.",
    },
    {
      id: "item-4",
      question: "What if two agents edit the same files?",
      answer:
        "Every agent is started on its own isolated git worktree lane unless you explicitly place them together on the pair lane. Merging stays a standard git pull request, not a silent overwrite.",
    },
    {
      id: "item-5",
      question: "Is there something to install?",
      answer:
        "No. A browser is enough. No companion app or desktop client required.",
    },
  ];

  return (
    <section id="the-details" className="w-full border-t border-[var(--border)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column Description */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-wider block">
              04 / Questions
            </span>
            <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--foreground)]">
              Frequently asked questions.
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-normal">
              Architecture, custody, and concurrency details for engineering teams.
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
