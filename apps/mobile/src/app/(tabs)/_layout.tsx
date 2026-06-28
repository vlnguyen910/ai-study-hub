import { Tabs } from "expo-router";

import { BottomTabBar } from "@/components/navigation";
import { AuthHeaderAction } from "@/features/auth/components/AuthHeaderAction";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerRight: () => <AuthHeaderAction />,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Trang chủ" }} />
      <Tabs.Screen name="search" options={{ title: "Tìm kiếm" }} />
      <Tabs.Screen name="library" options={{ title: "Thư viện" }} />
    </Tabs>
  );
}
