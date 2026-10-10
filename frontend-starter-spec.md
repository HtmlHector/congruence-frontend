# Frontend Starter Specification

## Goal

Create a reusable **frontend starter template** that can be copied into a separate, independent app for each future product. It is not a shared runtime, monorepo package, or single multi-product frontend. Each product should own and evolve its own copy of the starter.

This first step establishes a clean Next.js frontend foundation. A separate app exists as a possible future source of reusable components, but it is not available for this step; selected components can be inspected and ported later.

## Repository context

- The working directory is the repository root, currently an empty `frontend` directory.
- There are no existing source files, package-manager conventions, or app configuration to preserve.
- Create the Next.js project directly in the current directory; do not nest it in another app folder.

## Agreed technology and structure

- Next.js with the App Router and current standard defaults.
- TypeScript.
- pnpm.
- Tailwind CSS configured as needed by shadcn/ui.
- shadcn/ui set up with its standard baseline styling and defaults; do not add bespoke Parabox branding or a custom design system.
- `src/` application directory and `@/*` import alias.
- Choose a Node.js minimum version that meets the current requirements of Next.js and the selected dependencies at implementation time. Verify the current requirement rather than assuming a version.

The exact compatible package versions and current CLI flags should be checked when implementation begins. Web search was attempted during discovery but was unavailable, so no version-specific instructions have been asserted here.

## Initial experience

- Provide a clean, minimal starter screen that confirms the app runs.
- Keep the visual treatment neutral and easy to replace for a product. Use required shadcn/Tailwind defaults only; no Parabox branding and no elaborate styled component showcase.
- Do not build a product-specific workflow or connect to a real backend or AI provider.

## UI and assistant libraries

- Install and initialize shadcn/ui in a usable way, including required configuration and baseline styles.
- Add Assistant UI packages/integration scaffolding, but do **not** implement a chat screen or connect it to a model. The initial route remains the clean starter screen.
- Do not add an AI provider SDK, API keys, real AI requests, or mocked chat behavior.

## Authentication

- Add Clerk as the authentication provider and configure the Next.js integration using its current recommended App Router approach at implementation time.
- Keep the initial routes public. Authentication should be ready for later use, but must not gate the starter screen.
- Do not add sign-in/sign-up pages, visible auth controls, or user-profile UI in this initial foundation.
- Add an example environment file with placeholder Clerk variable names and setup guidance; never include real credentials. The project should be scaffoldable without keys, while running Clerk-dependent behavior may require the user to provide keys.

## Server state and persistence (TanStack)

- Include TanStack Query for server-state fetching/cache management.
- Include persistence of the TanStack Query cache to browser `localStorage` using the compatible TanStack Query persistence packages/current recommended approach, verified at implementation time.
- Add a small working example that demonstrates a query and localStorage persistence. Keep it self-contained and suitable for a starter; do not connect it to a real backend or add mock API endpoints. The example may use a small local, deterministic in-memory/static data source, clearly distinguished from the typed API wrapper and production backend calls.
- Handle browser-only storage safely in the Next.js App Router: avoid reading `localStorage` during server rendering, and ensure hydration remains correct. Include sensible persistence controls such as a stable query-client lifetime and an explicit persistence key/buster as appropriate.
- Document how the example works and how product apps should use or disable persistence for sensitive/user-specific data. Do not persist secrets or imply that browser-local cache storage is a secure data store.

## Backend/API boundary

- Add a small typed fetch wrapper as a neutral seam for future backend requests.
- It should support a configurable base URL and provide basic, typed error handling.
- Do not select or integrate a backend vendor, add a backend service, create sample API endpoints, or introduce mock data.
- Document the API boundary and any configuration in the README and example environment file as appropriate.
- Preferred approach over server actions: the wrapper keeps browser/API requests explicit and provider-neutral without committing to a server-side Next.js action contract.

## Forms

- Include a conventional form and schema-validation foundation.
- Proposed default libraries: React Hook Form and Zod, subject to a quick compatibility/convention check when implementation begins. If the project’s current package/library guidance suggests a better compatible pair, record that before changing the selection.
- Do not build a product-specific form; a minimal integration/example is acceptable only if needed to verify the setup.

## Quality and developer workflow

Provide scripts and configuration for:

- ESLint linting.
- TypeScript type checking.
- Unit/component tests, including at least one meaningful starter test.
- Playwright browser-level end-to-end tests, including at least one smoke test of the public starter screen.

Also include a useful README covering prerequisites, installation, environment setup, development, production build/run, all quality-check commands, and how to prepare a copied starter for a new product.

Keep the runtime focused on local Node.js development. Do not add Docker or compose files.

## Copying and product adaptation

- The template is intended to be copied per product, with no cross-product runtime sharing.
- Add both:
  1. A standard README adaptation checklist; and
  2. A copy-renaming script that accepts a supplied product name and updates common app identity in package metadata, README title, and basic app metadata/title.
- The rename operation should be explicit and predictable; do not make it silently overwrite unrelated project content.
- Do not add product-specific branding or assume that the future component-source app’s structure matches this template.

## Future component source

- No components are to be imported now.
- Once the other app is available, inspect it and selectively port components that are useful to a particular product/template, without assuming a wholesale copy or exact structural match.

## Non-goals

- Building an actual product or marketing site.
- Creating one app that hosts several products.
- Publishing or deploying the app.
- Adding a backend/database, real API integration, auth-protected routes, AI provider, working chat, or secrets.
- Porting components from the other app in this phase.
- Adding Docker.

## Acceptance criteria

1. A Next.js App Router TypeScript project is initialized directly in the current `frontend` directory and uses pnpm.
2. The app uses `src/` and the `@/*` import alias.
3. Tailwind and shadcn/ui are configured sufficiently for normal shadcn components to be added and rendered, without custom Parabox branding.
4. Assistant UI is installed/scaffolded, but no AI provider is configured and no chat UI is required.
5. Clerk is configured with current App Router guidance; the starter page remains public and has no visible sign-in controls.
6. Example environment documentation uses placeholders only and does not require real credentials to scaffold.
7. A clean, neutral starter screen renders without a backend or AI service.
8. TanStack Query is configured and a small working example demonstrates cache persistence to `localStorage`, implemented safely for App Router/SSR and documented with privacy limitations.
9. A typed, configurable fetch wrapper with basic error handling exists; there is no sample endpoint or backend integration.
10. Form/schema libraries are present according to the agreed conventional pair (provisionally React Hook Form + Zod), with no product-specific form.
11. Lint, typecheck, unit/component test, and Playwright E2E commands are available; relevant checks pass, including one unit/component test and one public-route browser smoke test.
12. The README explains setup, environment, local development, production build/run, all checks, TanStack/localStorage usage, and per-product adaptation.
13. A safe, explicit-name script updates package metadata, README title, and basic app metadata/title for a product copy.
14. No Docker files, real secrets, real AI calls, backend provider integration, deployment, or components from the other app are introduced.
15. After implementation, verify the artifact through the interface a user will use: start the app locally and confirm the starter route renders; verify the TanStack/localStorage example behavior; run the checks above and verify the copy-renaming script’s result on a safe temporary/copy fixture.

## Open implementation-time verification

- Confirm current create-next-app options and current Next.js/Node requirements.
- Confirm current shadcn/ui, Assistant UI, Clerk, TanStack Query persistence, and Playwright setup instructions and their mutual compatibility.
- Confirm whether Assistant UI packages can be installed without adding an unused provider dependency, and keep integration scaffold minimal if so.
- Confirm TanStack Query persistence package/API choices and versions, along with other dependencies, before adding them. Web search was unavailable during spec discovery.
