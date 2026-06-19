import { Redirect, Stack } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { useSession } from "@/features/auth/context/SessionContext";

export default function AuthLayout() {
  const { isAuthenticated } = useSession();

  if (isAuthenticated) {
    return <Redirect href={ROUTES.HOME as never} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="verify-email" />
      </Stack.Protected>
    </Stack>
  );
}
