import { Redirect, Stack, usePathname } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { useSession } from "@/features/auth/context/SessionContext";

export default function ProtectedLayout() {
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="profile" />
        <Stack.Screen name="documents/upload" />
        <Stack.Screen name="documents/[id]/edit" />
        <Stack.Screen name="moderator" />
      </Stack.Protected>
    </Stack>
  );
}
