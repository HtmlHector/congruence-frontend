import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
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
    <ClerkProvider>
      <html
        lang="en"
        className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
        style={{ colorScheme: "dark" }}
      >
        <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased selection:bg-[var(--accent-claude-subtle)] selection:text-white">
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--surface-primary)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                fontFamily: "var(--font-sans)",
                borderRadius: "var(--radius-md)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
