import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/app/page";

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>,
  );
}

describe("starter home", () => {
  it("shows the neutral public screen and loads the local query example", async () => {
    renderHome();

    expect(screen.getByText("Frontend starter")).toBeInTheDocument();
    expect(screen.getByText("TanStack Query example")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Your foundation is ready.")).toBeInTheDocument();
    });
  });
});
