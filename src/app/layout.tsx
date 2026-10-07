import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "congruence.dev — Your repository, your agents, and the running app. In one place.",
  description:
    "A shared browser workspace for the coding agents you already use. Keep the files, terminal, and live preview together, then pick up from another device.",
  keywords: [
    "coding agents",
    "Claude Code",
    "Codex",
    "git worktrees",
    "browser workspace",
    "congruence",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * Theme is driven by `prefers-color-scheme` in globals.css, so `<html>`
     * must not carry a hard-coded `dark` class or `color-scheme: dark`.
     * Both were here and both pinned every surface to the obsidian palette.
     *
     * Clerk is wired to the app tokens rather than a fixed `@clerk/themes`
     * import, so Clerk chrome follows the same OS preference. No Clerk
     * component is rendered today, but this keeps that from becoming a
     * second dark-only island later.
     */
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "var(--primary)",
          colorBackground: "var(--surface-card)",
          colorNeutral: "var(--muted-foreground)",
        },
      }}
    >
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased selection:bg-[var(--accent-claude-subtle)] selection:text-[var(--selection-fg)]">
          {children}
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
