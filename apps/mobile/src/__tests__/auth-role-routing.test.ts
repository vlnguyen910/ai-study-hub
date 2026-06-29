import { ROUTES } from "@/constants/routes";
import { getPostLoginRoute } from "@/features/auth/utils/role-routing";

describe("auth role routing", () => {
  it("keeps a safe explicit redirect after login", () => {
    expect(getPostLoginRoute("ADMIN", "/profile")).toBe("/profile");
  });

  it("sends moderator-capable roles to the review queue by default", () => {
    expect(getPostLoginRoute("MODERATOR")).toBe(ROUTES.MODERATOR_DOCUMENTS);
    expect(getPostLoginRoute("ADMIN")).toBe(ROUTES.MODERATOR_DOCUMENTS);
  });

  it("sends regular users and unknown roles to home by default", () => {
    expect(getPostLoginRoute("USER")).toBe(ROUTES.HOME);
    expect(getPostLoginRoute(undefined)).toBe(ROUTES.HOME);
  });

  it("ignores unsafe external redirects", () => {
    expect(getPostLoginRoute("USER", "//evil.example")).toBe(ROUTES.HOME);
  });
});
