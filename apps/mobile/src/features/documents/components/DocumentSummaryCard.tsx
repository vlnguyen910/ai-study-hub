import { Icon } from "@/components/nativewindui/Icon";
import { Button, Card } from "@/components";
import { Text, View } from "react-native";

const formatSummaryPoints = (summary: string): string[] => {
  const lines = summary
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines;
  }

  return summary
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
};

interface DocumentSummaryCardProps {
  readonly summary?: string | null;
  readonly canGenerate: boolean;
  readonly isGenerating: boolean;
  readonly error?: string | null;
  readonly onGenerate: () => void;
}

export function DocumentSummaryCard({
  summary,
  canGenerate,
  isGenerating,
  error,
  onGenerate,
}: DocumentSummaryCardProps) {
  const points = summary?.trim() ? formatSummaryPoints(summary) : [];

  return (
    <Card
      className="mt-6"
      title="Tóm tắt bằng AI"
      subtitle="Các ý chính được sinh từ nội dung tài liệu."
    >
      {points.length > 0 ? (
        <View className="gap-3">
          {points.map((point, index) => (
            <View key={`${point}-${index}`} className="flex-row gap-3">
              <View className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <Text className="min-w-0 flex-1 text-sm leading-6 text-on-surface-variant">
                {point}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="gap-4">
          <View className="flex-row items-start gap-3">
            <View className="rounded-2xl bg-primary/10 p-3">
              <Icon name="sparkle" size={20} color="#004ac6" />
            </View>
            <Text className="min-w-0 flex-1 text-sm leading-6 text-on-surface-variant">
              Tài liệu này chưa có tóm tắt AI. Bạn có thể tạo tóm tắt nếu đã
              đăng nhập và tài liệu đã được xử lý nội dung.
            </Text>
          </View>

          {canGenerate ? (
            <Button loading={isGenerating} onPress={onGenerate}>
              Tạo tóm tắt bằng AI
            </Button>
          ) : (
            <Text className="text-sm text-on-surface-variant">
              Đăng nhập để tạo tóm tắt cho tài liệu.
            </Text>
          )}
        </View>
      )}

      {error ? <Text className="mt-3 text-sm text-error">{error}</Text> : null}
    </Card>
  );
}
