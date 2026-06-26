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
        <Text className="text-sm font-medium text-on-surface-variant">
          {label}
        </Text>
      ) : null}
      <View className="flex-row items-center rounded-2xl border border-outline-variant bg-surface-container-lowest px-3 py-3">
        <Text className="text-lg leading-none text-on-surface-variant">⌕</Text>
        <TextInput
          className="ml-2 flex-1 text-base text-on-surface"
          placeholderTextColor="#737686"
          value={value}
          {...props}
        />
        {onClear && hasValue ? (
          <Pressable
            accessibilityRole="button"
            onPress={onClear}
            className="ml-2 rounded-full bg-surface-container px-2 py-2"
          >
            <Text className="text-sm leading-none text-on-surface">×</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
