import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient, apiFetch } from "@/lib/api";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("apiFetch", () => {
  it("returns successful Axios response data", async () => {
    const requestSpy = vi.spyOn(apiClient, "request").mockResolvedValue({
      data: { ok: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    });

    await expect(apiFetch<{ ok: boolean }>("/health")).resolves.toEqual({ ok: true });
    expect(requestSpy).toHaveBeenCalledWith({ url: "/health" });
  });

  it("passes JSON bodies and request options through Axios", async () => {
    const requestSpy = vi.spyOn(apiClient, "request").mockResolvedValue({
      data: { id: 1 },
      status: 201,
      statusText: "Created",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    });

    await apiFetch("/items", {
      method: "POST",
      data: { title: "Example" },
    });

    expect(requestSpy).toHaveBeenCalledWith({
      url: "/items",
      method: "POST",
      data: { title: "Example" },
    });
  });

  it("throws a typed error for Axios response errors", async () => {
    const response = {
      data: { message: "Not found" },
      status: 404,
      statusText: "Not Found",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    };
    const axiosError = new axios.AxiosError(
      "Request failed with status code 404",
      "ERR_BAD_REQUEST",
      { headers: new axios.AxiosHeaders() },
      undefined,
      response,
    );
    vi.spyOn(apiClient, "request").mockRejectedValue(axiosError);

    await expect(apiFetch("/missing")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      body: { message: "Not found" },
      code: "ERR_BAD_REQUEST",
    });
  });

  it("normalizes network errors without an HTTP response", async () => {
    vi.spyOn(apiClient, "request").mockRejectedValue(new Error("offline"));

    await expect(apiFetch("/offline")).rejects.toMatchObject({
      name: "ApiError",
      status: 0,
      message: "offline",
    });
  });
});
