import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/nativewindui/Icon";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Button, PageShell } from "@/components";
import { ROUTES } from "@/constants/routes";
import { AuthHeaderAction } from "@/features/auth/components/AuthHeaderAction";
import { fetchDocuments } from "@/features/documents/services/documents.service";
import type { LibraryDocument } from "@/features/documents/types/document.types";
import { ReviewDocumentCard } from "../components/ReviewDocumentCard";
import type { ReviewDocumentSummary } from "../types/document-review.types";

const scrollContentStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 32,
};

const formatBytes = (bytes?: number): string => {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)}${units[unitIndex]}`;
};

const formatRelativeDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const mapDocumentToReview = (
  document: LibraryDocument,
): ReviewDocumentSummary => ({
  id: document.id,
  title: document.title,
  author: `by ${document.author.name}`,
  uploadedAt: formatRelativeDate(document.createdAt),
  fileType: document.format?.toUpperCase() ?? "FILE",
  fileSize: formatBytes(document.sizeInBytes),
  description: document.description ?? "Tài liệu chưa có mô tả.",
  category: document.subject?.name ?? "Chưa phân loại",
  categoryKey: document.subject?.id ?? "uncategorized",
  priority:
    typeof document.aiScore === "number" && document.aiScore >= 0.75
      ? "high"
      : "normal",
});

export function DocumentReviewScreen() {
  const [documents, setDocuments] = useState<readonly LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchDocuments({
        page: 1,
        limit: 50,
        status: "PENDING",
      });
      setDocuments(
        response.documents.filter((document) => document.status === "PENDING"),
      );
    } catch {
      setDocuments([]);
      setError("Không thể tải hàng đợi kiểm duyệt.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const reviewDocuments = useMemo(
    () => documents.map(mapDocumentToReview),
    [documents],
  );

  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between border-b border-outline-variant bg-surface px-4 py-4">
          <Text className="text-2xl font-bold tracking-tight text-primary">
            AcademiShare
          </Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              className="rounded-full p-2"
              onPress={() => void loadDocuments()}
            >
              <Icon
                materialIcon={{ name: "refresh" }}
                sfSymbol={{ name: "arrow.clockwise" as any }}
                size={22}
                color="#434655"
              />
            </Pressable>
            <AuthHeaderAction />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={scrollContentStyle}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void loadDocuments()}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View className="items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest py-10">
              <ActivityIndicator />
              <Text className="text-sm text-on-surface-variant">
                Đang tải tài liệu chờ duyệt...
              </Text>
            </View>
          ) : error ? (
            <View className="items-start gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
              <Text className="text-sm leading-6 text-error">{error}</Text>
              <Button variant="outline" size="sm" onPress={loadDocuments}>
                Thử lại
              </Button>
            </View>
          ) : reviewDocuments.length === 0 ? (
            <View className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
              <Text className="text-sm leading-6 text-on-surface-variant">
                Không có tài liệu nào đang chờ duyệt.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {reviewDocuments.map((document) => (
                <ReviewDocumentCard
                  key={document.id}
                  document={document}
                  onSeeDetail={() =>
                    router.push(
                      ROUTES.MODERATOR_DOCUMENT_DETAIL(document.id) as never,
                    )
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </PageShell>
  );
}
