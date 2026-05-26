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
        name="(templates)/moderator-document-review"
        options={{
          title: "Review Queue",
        }}
      />
      <Stack.Screen
        name="(templates)/moderator-document-detail"
        options={{
          title: "Document Detail",
        }}
      />
      <Stack.Screen
        name="(templates)/auth-login"
        options={{
          title: "Login",
        }}
      />
      <Stack.Screen
        name="(templates)/auth-register"
        options={{
          title: "Register",
        }}
      />
      <Stack.Screen
        name="(templates)/auth-forgot-password"
        options={{
          title: "Forgot Password",
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
