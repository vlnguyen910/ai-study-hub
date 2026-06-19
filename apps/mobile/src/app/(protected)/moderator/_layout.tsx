import { Redirect, Stack } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { useSession } from "@/features/auth/context/SessionContext";

export default function ModeratorLayout() {
  const { user } = useSession();
  const canModerate = user?.role === "MODERATOR" || user?.role === "ADMIN";

  if (!canModerate) {
    return <Redirect href={ROUTES.HOME as never} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
