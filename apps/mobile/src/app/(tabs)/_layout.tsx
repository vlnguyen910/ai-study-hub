import { Tabs, router, useFocusEffect } from "expo-router";
import { Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBar } from "@/components/navigation";
import { removeTokens, getAccessToken } from "@/utils/storage";
import { useState, useCallback } from "react";

export default function TabsLayout() {
  const [hasToken, setHasToken] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const checkToken = async () => {
        const token = await getAccessToken();
        if (isActive) {
          setHasToken(!!token);
        }
      };
      checkToken();
      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          headerRight: () =>
            hasToken ? (
              <Pressable
                onPress={async () => {
                  await removeTokens();
                  setHasToken(false);
                  Alert.alert("Thành công", "Đăng xuất thành công");
                  router.replace("/home");
                }}
                style={{ marginRight: 16 }}
              >
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              </Pressable>
            ) : null,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "Search",
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarLabel: "Library",
        }}
      />
    </Tabs>
  );
}
