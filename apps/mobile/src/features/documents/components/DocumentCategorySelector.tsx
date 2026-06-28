import { Pressable, Text, View } from "react-native";
import { Icon } from "@/components/nativewindui/Icon";
import type { DocumentCategoryOption } from "../types/document.types";

interface DocumentCategorySelectorProps {
  readonly value: string;
  readonly options: readonly DocumentCategoryOption[];
  readonly onChange: (value: string) => void;
  readonly errorMessage?: string;
  readonly isLoading?: boolean;
}

export function DocumentCategorySelector({
  value,
  options,
  onChange,
  errorMessage,
  isLoading = false,
}: DocumentCategorySelectorProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-bold text-on-surface">
        Danh mục / Môn học
      </Text>
      {isLoading ? (
        <Text className="text-sm text-on-surface-variant">
          Đang tải danh sách môn học...
        </Text>
      ) : null}
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option.value)}
              className={`flex-row items-center gap-2 rounded-full border px-4 py-2.5 ${
                active
                  ? "border-primary bg-primary-container"
                  : "border-outline-variant bg-surface-container-lowest"
              }`}
            >
              {active ? (
                <Icon
                  materialIcon={{ name: "check" }}
                  size={15}
                  color="#004ac6"
                />
              ) : null}
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
        <Text className="text-sm font-medium text-error">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
