# Parabox Frontend Starter

> Production Next.js starter pre-wired with Supabase Auth, Stripe Billing, and the Parabox Design System.

This repository serves as the baseline template cloned by the Parabox Studio `frontend-engineer` subagent when implementing products defined under the **Six Documents Before Vibe Coding** standard.

---

## Primitives Included

1. **Supabase Auth (`src/lib/supabase/`):**
   * Server-side authentication with `@supabase/ssr`
   * Middleware session refresh & route protection (`/dashboard`, `/login`, `/signup`)
   * Pre-built login, signup, and OAuth/magic link callback flows
2. **Stripe Billing (`src/lib/stripe/`):**
   * Pre-configured Stripe Checkout route (`/api/stripe/checkout`)
   * Customer Billing Portal API (`/api/stripe/portal`)
   * Webhook event handler for subscription updates (`/api/stripe/webhook`)
   * Subscription tier cards with 1-click checkout
3. **Parabox Design System (`src/styles/globals.css`):**
   * Warm paper canvas (`#faf9f6`), charcoal ink (`#252522`), forest green accents (`#354b42`)
   * Newsreader serif + Inter sans typography scales
   * Full suite of Shadcn UI components in `src/components/ui/`
   * Responsive left-rail navigation layout (`RailSidebar`)

---

## Quickstart

### 1. Install Dependencies
```bash
npm install
# or: pnpm install / bun install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project keys and Stripe API credentials.

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page and dashboard.
