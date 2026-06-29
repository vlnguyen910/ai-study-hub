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
        headerRight: () => <AuthHeaderAction showProfile={false} />,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Trang chủ" }} />
      <Tabs.Screen name="search" options={{ title: "Tìm kiếm" }} />
      <Tabs.Screen
        name="upload"
        options={{ title: "Tải lên", headerShown: false }}
      />
      <Tabs.Screen name="library" options={{ title: "Thư viện" }} />
      <Tabs.Screen
        name="profile"
        options={{ title: "Hồ sơ", headerShown: false }}
      />
    </Tabs>
  );
}
