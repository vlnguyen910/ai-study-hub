import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface DocumentUploadFieldProps {
  readonly fileName: string | null;
  readonly onPickSample: () => void;
  readonly onClear: () => void;
  readonly errorMessage?: string;
}

export function DocumentUploadField({
  fileName,
  onPickSample,
  onClear,
  errorMessage,
}: DocumentUploadFieldProps) {
  return (
    <View className="gap-2">
      <Pressable
        accessibilityRole="button"
        onPress={onPickSample}
        className="rounded-2xl border-2 border-dashed border-secondary bg-surface-container-lowest p-6"
      >
        <View className="items-center gap-3 text-center">
          <MaterialIcons name="cloud-upload" size={36} color="#004ac6" />
          <Text className="text-base font-semibold text-on-surface">
            {fileName ? "Tệp đã chọn" : "Nhấn để chọn tệp"}
          </Text>
          <Text className="text-sm text-on-surface-variant">
            Hỗ trợ PDF, DOCX, PPTX. Tối đa 50MB.
          </Text>
          {fileName ? (
            <View className="mt-2 w-full rounded-2xl bg-surface-container-low px-4 py-3">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-row flex-1 items-center gap-2">
                  <MaterialIcons name="description" size={18} color="#004ac6" />
                  <Text className="flex-1 text-sm font-semibold text-on-surface">
                    {fileName}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={onClear}
                  className="rounded-full bg-surface-container-high px-3 py-1"
                >
                  <Text className="text-xs font-semibold text-on-surface-variant">
                    Xóa
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Pressable>
      {errorMessage ? (
        <Text className="text-sm text-error">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
