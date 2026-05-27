import { Pressable, Text, View } from "react-native";
import type {
  DocumentCategoryOption,
  DocumentCategoryValue,
} from "../types/document.types";

interface DocumentCategorySelectorProps {
  readonly value: DocumentCategoryValue | "";
  readonly options: readonly DocumentCategoryOption[];
  readonly onChange: (value: DocumentCategoryValue) => void;
  readonly errorMessage?: string;
}

export function DocumentCategorySelector({
  value,
  options,
  onChange,
  errorMessage,
}: DocumentCategorySelectorProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-on-surface">
        Danh mục / Môn học
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option.value)}
              className={`rounded-full border px-4 py-2 ${active ? "border-primary bg-primary-container" : "border-outline-variant bg-surface"}`}
            >
              <Text
                className={`text-sm font-semibold ${active ? "text-on-primary-container" : "text-on-surface-variant"}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {errorMessage ? (
        <Text className="text-sm text-error">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
