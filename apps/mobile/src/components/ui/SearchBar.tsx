import { Icon } from "@/components/nativewindui/Icon";
import type { TextInputProps } from "react-native";
import { Pressable, Text, TextInput, View } from "react-native";

export interface SearchBarProps extends TextInputProps {
  readonly label?: string;
  readonly onClear?: () => void;
}

export function SearchBar({ label, onClear, value, ...props }: SearchBarProps) {
  const hasValue =
    typeof value === "string" ? value.trim().length > 0 : Boolean(value);

  return (
    <View className="gap-2">
      {label ? (
        <Text className="text-sm font-semibold text-on-surface-variant">
          {label}
        </Text>
      ) : null}
      <View className="flex-row items-center rounded-3xl border border-outline-variant/80 bg-surface-container-lowest px-4 py-3.5 shadow-sm shadow-black/5">
        <Icon materialIcon={{ name: "search" }} size={21} color="#737686" />
        <TextInput
          className="ml-3 flex-1 p-0 text-base text-on-surface"
          placeholderTextColor="#737686"
          value={value}
          {...props}
        />
        {onClear && hasValue ? (
          <Pressable
            accessibilityRole="button"
            onPress={onClear}
            className="ml-2 rounded-full bg-surface-container-high p-2"
          >
            <Icon materialIcon={{ name: "close" }} size={16} color="#191b23" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
