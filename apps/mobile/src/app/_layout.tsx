import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(templates)/feature-template"
        options={{
          title: "Feature Template",
        }}
      />
      <Stack.Screen
        name="notFound"
        options={{
          title: "Not Found",
        }}
      />
    </Stack>
  );
}
