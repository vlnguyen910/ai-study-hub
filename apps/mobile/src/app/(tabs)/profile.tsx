import { Redirect, usePathname } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { useSession } from "@/features/auth";
import { ProfileScreen } from "@/features/profile";

export default function ProfileRoute() {
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

  return <ProfileScreen showBackButton={false} />;
}
