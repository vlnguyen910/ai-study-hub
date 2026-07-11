import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { UserInfo } from "../src/components/ui/UserInfo";
import { useAuthStore } from "../src/stores/auth/store";

describe("UserInfo", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it("normalizes mojibake in the profile name before rendering", () => {
    const displayName = "Ng\u01B0\u1EDDi d\u00F9ng";
    const mojibakeName = new TextDecoder("iso-8859-1").decode(
      new TextEncoder().encode(displayName),
    );

    useAuthStore.getState().setAuth(
      "access-token",
      "student",
      {
        id: "user-1",
        email: "student@example.com",
        name: mojibakeName,
        role: "student",
        avatar: "https://example.com/avatar.png",
        status: "ACTIVE",
        createdAt: new Date("2026-06-08T00:00:00.000Z"),
      },
      null,
    );

    render(<UserInfo />);

    expect(screen.getByText(displayName)).toBeInTheDocument();
  });
});
