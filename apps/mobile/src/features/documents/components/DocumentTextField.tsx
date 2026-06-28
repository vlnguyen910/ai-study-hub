import { Icon } from "@/components/nativewindui/Icon";
import { Pressable, Text, TextInput, View } from "react-native";

interface DocumentTextFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly placeholder?: string;
  readonly multiline?: boolean;
  readonly errorMessage?: string;
  readonly onPressAi?: () => void;
  readonly isAiLoading?: boolean;
}

export function DocumentTextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  errorMessage,
  onPressAi,
  isAiLoading = false,
}: DocumentTextFieldProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-on-surface">{label}</Text>
        {onPressAi && (
          <Pressable
            accessibilityRole="button"
            onPress={onPressAi}
            disabled={isAiLoading}
            className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 active:bg-primary/15"
          >
            <Icon
              name={isAiLoading ? "restart" : "sparkle"}
              size={13}
              color="#004ac6"
            />
            <Text className="text-xs font-semibold text-primary">
              {isAiLoading ? "Đang tạo..." : "Tạo bằng AI"}
            </Text>
          </Pressable>
        )}
      </View>
      <TextInput
        className={`rounded-3xl border border-outline-variant/80 bg-surface-container-lowest px-4 text-base text-on-surface shadow-sm shadow-black/5 ${multiline ? "min-h-[120px] py-4" : "py-3.5"}`}
        placeholder={placeholder}
        placeholderTextColor="#737686"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        editable={!isAiLoading}
      />
      {errorMessage ? (
        <Text className="text-sm font-medium text-error">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
