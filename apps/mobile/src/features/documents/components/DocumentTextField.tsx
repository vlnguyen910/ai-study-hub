import { Text, TextInput, View } from "react-native";

interface DocumentTextFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly placeholder?: string;
  readonly multiline?: boolean;
  readonly errorMessage?: string;
}

export function DocumentTextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  errorMessage,
}: DocumentTextFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-on-surface">{label}</Text>
      <TextInput
        className={`rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 text-base text-on-surface ${multiline ? "min-h-[112px] py-4" : "py-3.5"}`}
        placeholder={placeholder}
        placeholderTextColor="#737686"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {errorMessage ? (
        <Text className="text-sm text-error">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
