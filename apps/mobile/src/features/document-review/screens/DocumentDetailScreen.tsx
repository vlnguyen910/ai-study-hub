import { Icon } from "@/components/nativewindui/Icon";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Button, Card, PageShell } from "@/components";
import { ROUTES } from "@/constants/routes";
import { DocumentPreview } from "@/features/documents/components/DocumentPreview";
import {
  approveDocument,
  fetchDocumentDetail,
  rejectDocument,
  runModeratorAnalysis,
} from "@/features/documents/services/documents.service";
import type {
  DocumentDetail,
  ModeratorAnalysisData,
} from "@/features/documents/types/document.types";
import { DocumentStatCard } from "../components/DocumentStatCard";

const scrollContentStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 152,
};

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

export function DocumentDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const documentId = useMemo(() => {
    const value = params.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params.id]);

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [analysis, setAnalysis] = useState<ModeratorAnalysisData | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(documentId));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(
    documentId ? null : "Thiếu mã tài liệu để kiểm duyệt.",
  );

  const loadDocument = useCallback(async () => {
    if (!documentId) return;

    setIsLoading(true);
    setError(null);
    try {
      const detail = await fetchDocumentDetail(documentId);
      setDocument(detail);
    } catch {
      setDocument(null);
      setError("Không thể tải chi tiết tài liệu kiểm duyệt.");
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    void loadDocument();
  }, [loadDocument]);

  const stats = useMemo(
    () =>
      document
        ? [
            { label: "Người tải lên", value: document.author.name },
            { label: "Ngày gửi", value: formatDate(document.createdAt) },
            { label: "Định dạng", value: document.format.toUpperCase() },
            { label: "Dung lượng", value: formatBytes(document.sizeInBytes) },
          ]
        : [],
    [document],
  );

  const handleRunAnalysis = async () => {
    if (!documentId || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await runModeratorAnalysis(documentId);
      setAnalysis(result);
    } catch {
      setError(
        "Không thể chạy phân tích AI. Tài liệu có thể chưa được xử lý nội dung.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    if (!documentId || isApproving || isRejecting) return;

    setIsApproving(true);
    try {
      await approveDocument(documentId);
      Alert.alert("Đã duyệt", "Tài liệu đã được phê duyệt.");
      router.replace(ROUTES.MODERATOR_DOCUMENTS as never);
    } catch {
      Alert.alert("Không thể duyệt", "Vui lòng thử lại sau.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!documentId || isApproving || isRejecting) return;

    const normalizedReason = rejectReason.trim();
    if (!normalizedReason) {
      Alert.alert("Thiếu lý do", "Vui lòng nhập lý do từ chối tài liệu.");
      return;
    }

    setIsRejecting(true);
    try {
      await rejectDocument(documentId, { rejectionReason: normalizedReason });
      Alert.alert("Đã từ chối", "Tài liệu đã được từ chối.");
      router.replace(ROUTES.MODERATOR_DOCUMENTS as never);
    } catch {
      Alert.alert("Không thể từ chối", "Vui lòng thử lại sau.");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 bg-surface">
        <View className="flex-row items-center border-b border-outline-variant bg-surface px-4 py-4">
          <Pressable
            accessibilityRole="button"
            className="-ml-2 rounded-full p-2"
            onPress={() => router.back()}
          >
            <Icon name="chevron.left" size={22} color="#191b23" />
          </Pressable>
          <Text className="ml-1 flex-1 text-xl font-bold tracking-tight text-on-surface">
            Kiểm duyệt tài liệu
          </Text>
          <Pressable
            accessibilityRole="button"
            className="rounded-full p-2"
            onPress={() => void handleRunAnalysis()}
          >
            <Icon name="flag" size={22} color="#191b23" />
          </Pressable>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center gap-3 px-6">
            <ActivityIndicator />
            <Text className="text-sm text-on-surface-variant">
              Đang tải tài liệu kiểm duyệt...
            </Text>
          </View>
        ) : error && !document ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-sm leading-6 text-error">
              {error}
            </Text>
          </View>
        ) : document ? (
          <>
            <ScrollView
              className="flex-1"
              contentContainerStyle={scrollContentStyle}
              showsVerticalScrollIndicator={false}
            >
              <DocumentPreview document={document} />

              <View className="mt-5 gap-6">
                <View>
                  <View className="mb-2 flex-row flex-wrap gap-2">
                    <Text className="rounded bg-secondary-container px-2 py-1 text-[10px] font-bold uppercase text-on-secondary-container">
                      {document.subject?.name ?? "Chưa phân loại"}
                    </Text>
                    <Text className="rounded bg-surface-container-highest px-2 py-1 text-[10px] font-bold uppercase text-on-surface-variant">
                      {document.status}
                    </Text>
                  </View>
                  <Text className="text-2xl font-bold leading-8 text-on-surface">
                    {document.title}
                  </Text>
                </View>

                <View className="flex-row flex-wrap gap-3">
                  {stats.map((stat, index) => (
                    <View key={stat.label} className="w-[48%]">
                      <DocumentStatCard stat={stat} highlight={index === 3} />
                    </View>
                  ))}
                </View>

                <Card
                  title="Mô tả chi tiết"
                  subtitle="Thông tin do người tải lên cung cấp."
                >
                  <Text className="text-base leading-7 text-on-surface-variant">
                    {document.description ?? "Tài liệu chưa có mô tả."}
                  </Text>
                </Card>

                <Card
                  title="Phân tích kiểm duyệt AI"
                  subtitle="Chạy phân tích để xem đề xuất và cảnh báo."
                >
                  <View className="gap-4">
                    <Button
                      loading={isAnalyzing}
                      onPress={() => void handleRunAnalysis()}
                    >
                      Chạy phân tích kiểm duyệt AI
                    </Button>

                    {analysis ? (
                      <View className="gap-3">
                        <Text className="text-sm font-semibold text-on-surface">
                          Đề xuất: {analysis.moderationSuggestion}
                        </Text>
                        <Text className="text-sm leading-6 text-on-surface-variant">
                          {analysis.moderationReason}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {analysis.flags.length > 0 ? (
                            analysis.flags.map((flag) => (
                              <Text
                                key={flag}
                                className="rounded-full bg-error/10 px-3 py-1 text-xs font-semibold text-error"
                              >
                                {flag}
                              </Text>
                            ))
                          ) : (
                            <Text className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                              Không có cảnh báo
                            </Text>
                          )}
                        </View>
                        <Text className="text-sm leading-6 text-on-surface-variant">
                          {analysis.summary}
                        </Text>
                      </View>
                    ) : null}

                    {error ? (
                      <Text className="text-sm leading-6 text-error">
                        {error}
                      </Text>
                    ) : null}
                  </View>
                </Card>

                <Card
                  title="Từ chối tài liệu"
                  subtitle="Nhập lý do rõ ràng nếu cần từ chối."
                >
                  <TextInput
                    className="min-h-[96px] rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-base text-on-surface"
                    placeholder="Ví dụ: Nội dung không phù hợp hoặc thiếu thông tin học thuật."
                    placeholderTextColor="#737686"
                    value={rejectReason}
                    multiline
                    textAlignVertical="top"
                    onChangeText={setRejectReason}
                  />
                </Card>
              </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 border-t border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-4">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Button
                    variant="outline"
                    fullWidth
                    loading={isRejecting}
                    disabled={isApproving}
                    onPress={() => void handleReject()}
                  >
                    Từ chối
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    fullWidth
                    loading={isApproving}
                    disabled={isRejecting}
                    leftIcon={
                      <Icon name="checkmark.circle" size={18} color="#ffffff" />
                    }
                    onPress={() => void handleApprove()}
                  >
                    Phê duyệt
                  </Button>
                </View>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </PageShell>
  );
}
