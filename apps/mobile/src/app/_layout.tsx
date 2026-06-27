import "../global.css";

import { Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";

import { SessionProvider, useSession } from "@/features/auth";
import { useColorScheme } from "@/lib/useColorScheme";
import { NAV_THEME } from "@/theme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

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
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <SessionProvider>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? "light" : "dark"}`}
        style={isDarkColorScheme ? "light" : "dark"}
      />
      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <RootNavigator />
      </NavThemeProvider>
    </SessionProvider>
  );
}
