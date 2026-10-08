/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function FaqAccordion() {
  const faqs = [
    {
      id: "faq-non-tech",
      question: "Can non-technical team members (PMs, founders, designers) use Congruence?",
      answer:
        "Yes, absolutely. You never need to open a local terminal, configure Docker, or debug Node.js dependencies. Simply paste your GitHub repository link, instruct Claude Code, Google Antigravity, or Codex in natural English, and test the running application directly in the interactive live preview pane.",
    },
    {
      id: "faq-concurrency",
      question: "How does Congruence prevent multiple AI agents from overwriting each other's code?",
      answer:
        "Each agent runs on its own isolated Git worktree lane. If Claude is modifying backend routes while Antigravity is designing a navbar, they write to separate isolated working trees. You can inspect clean visual diffs and merge them cleanly into the main branch via standard Git pull requests.",
    },
    {
      id: "faq-custody",
      question: "Do you resell or mark up AI model tokens?",
      answer:
        "No. Congruence provides the execution workspace and browser-based developer harness. You bring your own Anthropic, OpenAI, or Google AI accounts or API keys. Inference runs directly against your existing subscriptions with zero token markup or third-party proxying.",
    },
    {
      id: "faq-devices",
      question: "Can I manage running workspaces from a tablet or mobile device?",
      answer:
        "Yes. Because the execution runs in the cloud sandbox, you can inspect running web previews, read agent diffs, and send prompt instructions from any modern browser, including iPadOS, Android tablets, and smartphones.",
    },
    {
      id: "faq-persistence",
      question: "What happens to my code and dev server when I close the browser?",
      answer:
        "Your code, Git history, file changes, and configured keys are saved to persistent disk. Active processes sleep automatically to conserve resources and wake up instantly when you reopen your workspace URL.",
    },
    {
      id: "faq-install",
      question: "Is there anything to download or install locally?",
      answer:
        "No downloads, no CLI wrappers, and no desktop applications required. A standard modern web browser is all you need to start building.",
    },
  ];

  return (
    <section id="the-details" className="w-full border-t border-[var(--border)] py-20 bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Left Column Description */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-widest block">
              04 / Questions & Details
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--foreground)]">
              Frequently asked questions.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-normal">
              Everything you need to know about custody, concurrency, non-technical workflows, and security.
            </p>
            <div className="pt-4 flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)]">
              <HelpCircle className="size-3.5 text-[var(--accent-claude)]" />
              <span>Questions answered by the engineering team</span>
            </div>
          </div>

          {/* Right Column Accordion */}
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible defaultValue="faq-non-tech" className="w-full space-y-3">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="rounded-[3.5px] border border-[var(--border)] bg-[var(--surface-primary)] px-6"
                >
                  <AccordionTrigger className="text-sm font-medium text-[var(--foreground)] hover:no-underline py-5 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed pb-6 pt-1 font-normal border-t border-[var(--border-subtle)]">
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
