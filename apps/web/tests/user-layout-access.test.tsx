import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UserLayout from "../src/app/(main)/(user)/layout";
import { useAuthStore } from "../src/stores/auth/store";
import { navigationMocks } from "./setup";

describe("user area role access", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/home");
  });

  it("redirects an authenticated admin from /home to /admin", async () => {
    useAuthStore.getState().setAuth("admin-token", "admin", {
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
      createdAt: new Date("2026-06-22T00:00:00.000Z"),
    });
    useAuthStore.getState().setHasHydrated(true);

    render(
      <UserLayout>
        <div>User home content</div>
      </UserLayout>,
    );

    await waitFor(() => {
      expect(navigationMocks.router.replace).toHaveBeenCalledWith("/admin");
    });
    expect(screen.queryByText("User home content")).not.toBeInTheDocument();
  });
});
