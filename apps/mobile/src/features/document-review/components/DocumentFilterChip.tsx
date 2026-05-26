import { Pressable, Text } from "react-native";

interface DocumentFilterChipProps {
  readonly label: string;
  readonly active?: boolean;
  readonly onPress: () => void;
}

export function DocumentFilterChip({
  label,
  active = false,
  onPress,
}: DocumentFilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${active ? "border-primary bg-primary-container" : "border-outline-variant bg-surface"}`}
    >
      <Text
        className={`whitespace-nowrap text-sm font-semibold ${active ? "text-on-primary-container" : "text-on-surface-variant"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
