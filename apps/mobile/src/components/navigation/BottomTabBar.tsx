import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-outline-variant bg-surface-container-lowest"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      <View className="flex-row px-3 pt-2">
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const isFocused = state.index === index;
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);
          const iconName =
            route.name === "home" ? "⌂" : route.name === "search" ? "⌕" : "▤";

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
              className="flex-1 items-center justify-center rounded-2xl px-2 py-2"
            >
              <View
                className={`items-center gap-1 rounded-2xl px-3 py-2 ${isFocused ? "bg-secondary-container" : "bg-transparent"}`}
              >
                <Text
                  className={`text-lg ${isFocused ? "text-primary" : "text-on-surface-variant"}`}
                >
                  {iconName}
                </Text>
                <Text
                  className={`text-xs font-medium ${isFocused ? "text-on-surface" : "text-on-surface-variant"}`}
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
