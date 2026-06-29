import { ROUTES } from "@/constants/routes";

type AccountRole = string | null | undefined;

const isSafeRedirect = (redirect?: string): redirect is string =>
  Boolean(redirect?.startsWith("/") && !redirect.startsWith("//"));

export const getPostLoginRoute = (
  role: AccountRole,
  redirect?: string,
): string => {
  if (isSafeRedirect(redirect)) {
    return redirect;
  }

  if (role === "MODERATOR" || role === "ADMIN") {
    return ROUTES.MODERATOR_DOCUMENTS;
  }

  return ROUTES.HOME;
};
