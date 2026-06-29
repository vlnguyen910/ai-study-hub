import { Redirect, usePathname } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { useSession } from "@/features/auth";
import { DocumentUploadScreen } from "@/features/documents";

export default function UploadRoute() {
  const pathname = usePathname();
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return (
      <Redirect
        href={
          {
            pathname: ROUTES.LOGIN,
            params: { redirect: pathname },
          } as never
        }
      />
    );
  }

  return (
    <DocumentUploadScreen cancelHref={ROUTES.HOME} showBackButton={false} />
  );
}
