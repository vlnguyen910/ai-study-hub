import { Icon } from "@/components/nativewindui/Icon";
import { router } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

import { ROUTES } from "@/constants/routes";
import { useSession } from "../context/SessionContext";

export function AuthHeaderAction() {
  const { isAuthenticated, signOut, user } = useSession();

  if (!isAuthenticated) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Login"
        className="mr-4 rounded-full bg-primary px-4 py-2"
        onPress={() => router.push(ROUTES.LOGIN as never)}
      >
        <Text className="text-sm font-semibold text-on-primary">Login</Text>
      </Pressable>
    );
  }

  return (
    <View className="mr-3 flex-row items-center gap-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        className="rounded-full p-2"
        onPress={() => router.push(ROUTES.PROFILE as never)}
      >
        <Icon name="person.circle" size={25} color="#004ac6" />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Logout"
        className="rounded-full p-2"
        onPress={() => {
          Alert.alert(
            "Logout",
            `Sign out${user?.name ? ` ${user.name}` : ""}?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                style: "destructive",
                onPress: () => {
                  void signOut().then(() =>
                    router.replace(ROUTES.HOME as never),
                  );
                },
              },
            ],
          );
        }}
      >
        <Icon
          name="rectangle.portrait.and.arrow.right"
          size={23}
          color="#ba1a1a"
        />
      </Pressable>
    </View>
  );
}
