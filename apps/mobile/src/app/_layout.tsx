import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Mobile Boilerplate",
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
