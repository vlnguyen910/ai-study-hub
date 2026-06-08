import { describe, expect, it } from "vitest";

import { getLoginRedirectHref } from "../app/lib/axios";

describe("auth redirect helpers", () => {
  it("builds login redirect URLs for protected pages", () => {
    expect(getLoginRedirectHref("/profile", "?tab=info")).toBe(
      "/login?redirect=%2Fprofile%3Ftab%3Dinfo",
    );
    expect(getLoginRedirectHref("/uploads")).toBe("/login?redirect=%2Fuploads");
  });

  it("does not add redirect params for public auth pages or root", () => {
    expect(getLoginRedirectHref("/")).toBe("/login");
    expect(getLoginRedirectHref("/login")).toBe("/login");
    expect(getLoginRedirectHref("/register")).toBe("/login");
    expect(getLoginRedirectHref("/reset-password/token")).toBe("/login");
    expect(getLoginRedirectHref("/verify-email/token")).toBe("/login");
  });
});
