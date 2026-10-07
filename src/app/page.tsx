import Link from "next/link";
import { ArrowRight, ShieldCheck, CreditCard, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-[980px] mx-auto px-6 py-16 md:py-24">
      <header className="mb-16 border-b border-[var(--border-line)] pb-8 flex justify-between items-baseline">
        <Link href="/" className="text-2xl font-serif tracking-tight font-medium">
          parabox
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/login" className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)]">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-3 py-1 bg-[var(--accent-primary)] text-[var(--ink-inverted)] rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="max-w-[640px]">
        <span className="text-xs uppercase tracking-wider text-[var(--ink-muted)] font-mono">
          Parabox Frontend Starter
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-medium mt-4 leading-tight">
          A dependable foundation for your next useful product.
        </h1>
        <p className="text-lg text-[var(--ink-secondary)] mt-6 leading-relaxed">
          Pre-wired with full-stack Supabase authentication, Stripe subscription billing,
          and the canonical Parabox editorial design system.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] text-[var(--ink-inverted)] rounded-sm font-medium hover:bg-[var(--accent-hover)] transition-all"
          >
            Start building <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--border-line)] rounded-sm hover:bg-[var(--bg-subtle)] transition-colors"
          >
            Go to dashboard
          </Link>
        </div>

        <section className="mt-20 pt-10 border-t border-[var(--border-line)] grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-3 text-[var(--accent-primary)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-medium text-base">Supabase Auth</h3>
            <p className="text-xs text-[var(--ink-muted)] mt-1.5 leading-normal">
              Server-side auth with session refresh, protected routes, and Row Level Security.
            </p>
          </div>

          <div>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-3 text-[var(--accent-primary)]">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-medium text-base">Stripe Billing</h3>
            <p className="text-xs text-[var(--ink-muted)] mt-1.5 leading-normal">
              Checkout sessions, customer billing portal, and lifecycle webhook listeners.
            </p>
          </div>

          <div>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-3 text-[var(--accent-primary)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-medium text-base">Editorial UI</h3>
            <p className="text-xs text-[var(--ink-muted)] mt-1.5 leading-normal">
              Newsreader typography, warm paper tones, and responsive rail navigation.
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-24 pt-6 border-t border-[var(--border-line)] text-xs text-[var(--ink-muted)] flex justify-between">
        <span>Parabox Foundation © 2026</span>
        <a href="https://parabox.so" target="_blank" rel="noreferrer">
          parabox.so
        </a>
      </footer>
    </div>
  );
}
