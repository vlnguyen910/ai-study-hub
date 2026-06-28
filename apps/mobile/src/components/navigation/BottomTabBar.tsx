import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/nativewindui/Icon";

const getTabIcon = (
  routeName: string,
): {
  name: string;
} => {
  switch (routeName) {
    case "home":
      return { name: "home" };
    case "search":
      return { name: "search" };
    case "library":
      return { name: "local-library" };
    default:
      return { name: "dashboard" };
  }
};

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-outline-variant/70 bg-surface-container-lowest/95 shadow-lg shadow-black/10"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="flex-row px-3 pt-3">
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const isFocused = state.index === index;
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);
          const icon = getTabIcon(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center rounded-3xl px-1 py-1"
              style={({ pressed }) => ({
                opacity: pressed ? 0.82 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View
                className={`min-w-[72px] items-center gap-1 rounded-3xl px-3 py-2.5 ${
                  isFocused ? "bg-primary-container" : "bg-transparent"
                }`}
              >
                <Icon
                  materialIcon={{ name: icon.name as any }}
                  size={22}
                  color={isFocused ? "#004ac6" : "#737686"}
                />
                <Text
                  className={`text-xs font-semibold ${
                    isFocused ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
