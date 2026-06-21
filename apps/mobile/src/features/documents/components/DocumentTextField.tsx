import { MaterialIcons } from "@expo/vector-icons";
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
    <View className="gap-1.5">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-semibold text-on-surface">{label}</Text>
        {onPressAi && (
          <Pressable
            accessibilityRole="button"
            onPress={onPressAi}
            disabled={isAiLoading}
            className="flex-row items-center gap-1 py-1 px-2.5 rounded-full bg-secondary/15 active:bg-secondary/25"
          >
            <MaterialIcons
              name={isAiLoading ? "sync" : "auto-awesome"}
              size={12}
              color="#004ac6"
            />
            <Text className="text-xs font-semibold text-primary">
              {isAiLoading ? "Đang tạo..." : "Tạo bằng AI"}
            </Text>
          </Pressable>
        )}
      </View>
      <TextInput
        className={`rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 text-base text-on-surface ${multiline ? "min-h-[112px] py-4" : "py-3.5"}`}
        placeholder={placeholder}
        placeholderTextColor="#737686"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        editable={!isAiLoading}
      />
      {errorMessage ? (
        <Text className="text-sm text-error">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
