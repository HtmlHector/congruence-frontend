import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BrowserPreview } from "./browser-preview";
import { apiClient } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("BrowserPreview Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/preview-ticket")) {
        return Promise.resolve({
          data: {
            ticket: "mock-ticket-xyz",
            preview_base_url: "/api/v1/projects/proj-1/preview",
            expires_in: 3600,
          },
        });
      }
      if (url.includes("/ping")) {
        return Promise.resolve({
          data: { live: false, port: 3000 },
        });
      }
      return Promise.reject(new Error("not found"));
    });
  });

  it("renders the browser start page when no initial port is given", async () => {
    render(<BrowserPreview projectId="proj-1" />);

    await waitFor(() => {
      expect(
        screen.getByText("Browse the web, search, or view your local devbox websites."),
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Search or URL")).toHaveValue("");
    expect(screen.getByRole("button", { name: "DuckDuckGo" })).toBeInTheDocument();
    expect(screen.getByText("Local ports:")).toBeInTheDocument();
  });

  it("switches to standby screen when local port is entered and dev server is offline", async () => {
    render(<BrowserPreview projectId="proj-1" initialPort={3000} />);

    await waitFor(() => {
      expect(screen.getByText("No server on port 3000")).toBeInTheDocument();
    });

    expect(screen.getByText("Auto-reconnecting")).toBeInTheDocument();
    expect(screen.getByText("pnpm dev")).toBeInTheDocument();
  });

  it("renders live iframe when ping returns live true for local port", async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/preview-ticket")) {
        return Promise.resolve({
          data: {
            ticket: "mock-ticket-xyz",
            preview_base_url: "/api/v1/projects/proj-1/preview",
            expires_in: 3600,
          },
        });
      }
      if (url.includes("/ping")) {
        return Promise.resolve({
          data: { live: true, port: 3000 },
        });
      }
      return Promise.reject(new Error("not found"));
    });

    render(<BrowserPreview projectId="proj-1" initialPort={3000} />);

    await waitFor(() => {
      expect(screen.getByTitle("Devbox Preview :3000")).toBeInTheDocument();
    });

    const iframe = screen.getByTitle("Devbox Preview :3000");
    expect(iframe).toHaveAttribute(
      "src",
      expect.stringContaining("/api/v1/projects/proj-1/preview/3000/?ticket=mock-ticket-xyz"),
    );
  });

  it("searches through the proxy instead of embedding the engine directly", async () => {
    render(<BrowserPreview projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "DuckDuckGo" })).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText("Search or URL");
    fireEvent.change(searchInput, { target: { value: "fastapi clean architecture" } });
    fireEvent.submit(searchInput.closest("form")!);

    const title = "Web Browser: https://html.duckduckgo.com/html/?q=fastapi%20clean%20architecture";
    await waitFor(() => {
      expect(screen.getByTitle(title)).toBeInTheDocument();
    });

    const iframe = screen.getByTitle(title);
    expect(iframe).toHaveAttribute(
      "src",
      expect.stringContaining(
        "/api/v1/projects/proj-1/preview/external?url=https%3A%2F%2Fhtml.duckduckgo.com%2Fhtml%2F%3Fq%3Dfastapi%2520clean%2520architecture",
      ),
    );
  });

  it("navigates to external web page via proxy when typing a web URL", async () => {
    render(<BrowserPreview projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "DuckDuckGo" })).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText("Search or URL");
    fireEvent.change(searchInput, { target: { value: "https://docs.python.org" } });
    fireEvent.submit(searchInput.closest("form")!);

    await waitFor(() => {
      expect(screen.getByTitle("Web Browser: https://docs.python.org")).toBeInTheDocument();
    });

    const iframe = screen.getByTitle("Web Browser: https://docs.python.org");
    expect(iframe).toHaveAttribute(
      "src",
      expect.stringContaining("/api/v1/projects/proj-1/preview/external?url=https%3A%2F%2Fdocs.python.org"),
    );
  });

  it("shows the page the iframe navigated to in the address bar", async () => {
    render(<BrowserPreview projectId="proj-1" />);

    const searchInput = screen.getByLabelText("Search or URL");
    fireEvent.change(searchInput, { target: { value: "https://docs.python.org" } });
    fireEvent.submit(searchInput.closest("form")!);

    const iframe = (await screen.findByTitle(
      "Web Browser: https://docs.python.org",
    )) as HTMLIFrameElement;
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "congruence:preview-navigate", url: "https://docs.python.org/3/tutorial/" },
        source: iframe.contentWindow,
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Search or URL")).toHaveValue(
        "https://docs.python.org/3/tutorial/",
      );
    });
  });

  it("updates viewport modes when clicking responsive toolbar buttons", async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/preview-ticket")) {
        return Promise.resolve({
          data: {
            ticket: "mock-ticket-xyz",
            preview_base_url: "/api/v1/projects/proj-1/preview",
            expires_in: 3600,
          },
        });
      }
      if (url.includes("/ping")) {
        return Promise.resolve({
          data: { live: true, port: 3000 },
        });
      }
      return Promise.reject(new Error("not found"));
    });

    render(<BrowserPreview projectId="proj-1" initialPort={3000} />);

    await waitFor(() => {
      expect(screen.getByTitle("Devbox Preview :3000")).toBeInTheDocument();
    });

    const mobileBtn = screen.getByTitle("Mobile Viewport (375px)");
    fireEvent.click(mobileBtn);

    const frameContainer = screen.getByTitle("Devbox Preview :3000").parentElement;
    expect(frameContainer).toHaveClass("w-[375px]");
  });
});
