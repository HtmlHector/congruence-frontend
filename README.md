# Product Frontend Starter

A copyable Next.js frontend foundation for independent products. Each product should own its own copy; this project does not provide a shared multi-product runtime.

## Requirements

- Node.js 20.9 or newer (the version required by current Next.js at scaffold time)
- pnpm (the version is pinned in `package.json`)

## Start locally

```bash
pnpm install
cp .env.example .env.local # optional; leave auth keys empty to run without Clerk
pnpm dev
```

Open <http://localhost:3001>.

## Environment

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are placeholders for Clerk auth. The root app layout wraps all routes in `ClerkProvider` when the publishable key is present, and `src/proxy.ts` enables Clerk middleware when both keys are set. Without credentials, the public starter still renders without auth; add keys in `.env.local` to activate Clerk. Routes remain public until explicitly protected.
- `NEXT_PUBLIC_API_BASE_URL` optionally configures the base URL used by the Axios client and `apiFetch` in `src/lib/api.ts`.
- `NEXT_PUBLIC_HELP_URL` sets the destination of the sidebar help button; it defaults to a placeholder URL.
- Never commit `.env.local` or real secrets. `.env*` is git-ignored.

## Included foundations

- **Next.js App Router, TypeScript, Tailwind CSS v4, and shadcn/ui**: Clean architecture with Radix UI primitives (`card`, `input`, `label`, `dropdown-menu`, `button`).
- **Complete Authentication Flow (`/sign-in`, `/sign-up`, `/sso-callback`, `/complete`)**:
  - Full Clerk auth flow with social OAuth (Google, GitHub) and enterprise SSO.
  - Custom branded form controllers with verification codes and live profile configuration.
  - Seamless fallback: app remains 100% runnable without Clerk credentials in dev/test mode.
- **Billing & Stripe Integration (`/billing`, `/billing/success`)**:
  - Configurable tier matrix (`Free`, `Pro`, `Enterprise`) via environment variables.
  - Hosted Stripe Checkout session initiation and Customer Portal redirects.
  - Real-time plan status and checkout confirmation views.
- **Multi-Tenant Workspace Scaffolding (`/[workspaceId]`)**:
  - URL-driven tenant routing with `WorkspaceBinder` injecting the `X-Workspace-Id` header across all API calls.
  - Compatible with FastAPI backend starter PostgreSQL Row-Level Security (RLS) policies.
  - Clean error classification and tenant isolation boundaries.
- **TanStack Query v5 & Safe Persistence**:
  - User-scoped localStorage persistence with automatic eviction on user sign-out.
  - Pre-configured `apiClient` singleton wiring Bearer tokens and tenant headers.
- **Forms & Validation**:
  - React Hook Form and Zod schemas available through `src/lib/forms.ts`.

## Commands

```bash
pnpm dev           # development server
pnpm build         # production build
pnpm start         # serve production build
pnpm lint          # ESLint
pnpm typecheck     # TypeScript checks
pnpm test          # Vitest unit/component tests
pnpm test:e2e      # Playwright browser smoke tests
pnpm check         # lint + typecheck + unit tests
```

On first E2E run, install the Playwright browser if needed:

```bash
pnpm exec playwright install chromium
```

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add card
```

Generated components use the `@/components/ui` and `@/lib` aliases.

## Prepare a copy for a product

1. Copy this folder to the product's repository; do not run the rename command in this template unless you intend to rename it.
2. Run `pnpm rename:product -- "Product Name"` to update package metadata, the README title, and page metadata.
3. Review `src/app/page.tsx`, styling tokens, favicon, and route structure; replace the neutral starter screen.
4. Set Clerk keys only if the product uses authentication; protect only the routes that require it.
5. Choose backend endpoints and use `apiFetch` or replace the API boundary as appropriate.
6. Review localStorage persistence before caching product data. Keep sensitive or user-scoped data out of persistent cache unless deliberately scoped and cleared.
7. Port selected components from the source app only after inspecting them for suitability; do not assume its structure is identical.
8. Run `pnpm check`, `pnpm test:e2e`, and `pnpm build` before shipping.

The rename script requires an explicit non-empty product name and updates only known identity fields. It does not rename directories or rewrite arbitrary files.
