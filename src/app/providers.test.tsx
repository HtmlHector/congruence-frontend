import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Providers } from "@/app/providers";

vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("app providers", () => {
  it("wraps the app in ClerkProvider when its publishable key is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_example");

    render(
      <Providers>
        <main>Application content</main>
      </Providers>,
    );

    expect(screen.getByTestId("clerk-provider")).toContainElement(
      screen.getByRole("main"),
    );
  });

  it("keeps the public starter usable without Clerk credentials", () => {
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "");

    render(
      <Providers>
        <main>Application content</main>
      </Providers>,
    );

    expect(screen.queryByTestId("clerk-provider")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
