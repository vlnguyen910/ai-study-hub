import { Icon } from "@/components/nativewindui/Icon";
import { Pressable, Text, View } from "react-native";

interface DocumentUploadFieldProps {
  readonly fileName: string | null;
  readonly onPick: () => void;
  readonly onClear: () => void;
  readonly errorMessage?: string;
}

export function DocumentUploadField({
  fileName,
  onPick,
  onClear,
  errorMessage,
}: DocumentUploadFieldProps) {
  return (
    <View className="gap-2">
      <Pressable
        accessibilityRole="button"
        onPress={onPick}
        className="rounded-[28px] border-2 border-dashed border-primary/45 bg-primary/5 p-6"
        style={({ pressed }) => ({
          opacity: pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        <View className="items-center gap-3 text-center">
          <View className="rounded-3xl bg-primary/10 p-4">
            <Icon
              materialIcon={{ name: "cloud-upload" }}
              size={34}
              color="#004ac6"
            />
          </View>
          <Text className="text-base font-semibold text-on-surface">
            {fileName ? "Tệp đã chọn" : "Nhấn để chọn tệp"}
          </Text>
          <Text className="text-sm text-on-surface-variant">
            Hỗ trợ PDF, DOCX, PPTX. Tối đa 10MB.
          </Text>
          {fileName ? (
            <View className="mt-2 w-full rounded-3xl border border-outline-variant/70 bg-surface-container-lowest px-4 py-3">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-row flex-1 items-center gap-2">
                  <Icon
                    materialIcon={{ name: "article" }}
                    size={18}
                    color="#004ac6"
                  />
                  <Text className="flex-1 text-sm font-semibold text-on-surface">
                    {fileName}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={onClear}
                  className="rounded-full bg-surface-container-high p-2"
                >
                  <Icon
                    materialIcon={{ name: "close" }}
                    size={16}
                    color="#434655"
                  />
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
