/**
 * Unit tests for authService.ts
 */
import { describe, it, vi, expect, beforeEach } from "vitest";
import type { Mock } from "vitest";
import apiClient from "../../api/client";
import { login, register } from "../../api/authService";
import type { AuthResponse } from "../../api/types";

vi.mock("../../api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockPost = apiClient.post as Mock;

const AUTH_RESPONSE: AuthResponse = {
  token: "jwt.token.here",
  email: "user@test.com",
  role: "User",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── login ────────────────────────────────────────────────────────────────────

describe("login", () => {
  it("calls POST /auth/login with credentials and returns tokens", async () => {
    mockPost.mockResolvedValue({ data: AUTH_RESPONSE });

    const result = await login("user@test.com", "pass123");

    expect(mockPost).toHaveBeenCalledOnce();
    expect(mockPost).toHaveBeenCalledWith("/auth/login", {
      email: "user@test.com",
      password: "pass123",
    });
    expect(result).toEqual(AUTH_RESPONSE);
  });

  it("propagates a 401 error from the server", async () => {
    mockPost.mockRejectedValue(new Error("Unauthorized"));

    await expect(login("bad@test.com", "wrong")).rejects.toThrow(
      "Unauthorized",
    );
  });
});

// ── register ─────────────────────────────────────────────────────────────────

describe("register", () => {
  it("calls POST /auth/register with credentials and returns tokens", async () => {
    mockPost.mockResolvedValue({ data: AUTH_RESPONSE });

    const result = await register("new@test.com", "pass123");

    expect(mockPost).toHaveBeenCalledWith("/auth/register", {
      email: "new@test.com",
      password: "pass123",
    });
    expect(result).toEqual(AUTH_RESPONSE);
  });
});
