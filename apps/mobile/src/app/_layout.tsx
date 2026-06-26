import "../global.css";

import { Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { SessionProvider, useSession } from "@/features/auth";

function RootNavigator() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-surface">
        <ActivityIndicator size="large" />
        <Text className="text-sm text-on-surface-variant">
          Restoring your session...
        </Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      <Stack.Screen
        name="documents/[id]"
        options={{ headerShown: false, title: "Document" }}
      />
      <Stack.Screen name="notFound" options={{ title: "Not Found" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}
