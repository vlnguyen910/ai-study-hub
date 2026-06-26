import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";

import { Button, PageShell } from "@/components";
import { ROUTES } from "@/constants/routes";
import { useSession } from "@/features/auth/context/SessionContext";
import { DocumentBottomActionBar } from "../components/DocumentBottomActionBar";
import { DocumentPreview } from "../components/DocumentPreview";
import { fetchDocumentDetail } from "../services/documents.service";
import type { DocumentDetail } from "../types/document.types";
import {
  buildCloudinaryDownloadUrl,
  buildDownloadFileName,
} from "../utils/document-download";
import { downloadDocumentToDevice } from "../utils/download-document";

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

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export function DocumentDetailScreen() {
  const { user } = useSession();
  const params = useLocalSearchParams<{ id?: string }>();
  const documentId = useMemo(() => {
    const value = params.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params.id]);

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(documentId));
  const [error, setError] = useState<string | null>(
    documentId ? null : "Thiếu mã tài liệu để tải chi tiết.",
  );
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

    fetchDocumentDetail(documentId)
      .then((response) => {
        if (!mounted) return;
        setDocument(response);
      })
      .catch(() => {
        if (!mounted) return;
        setDocument(null);
        setError("Không thể tải chi tiết tài liệu.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [documentId]);

  const downloadFile = async () => {
    if (!document?.fileUrl) return;

    setIsDownloading(true);
    try {
      const downloadUrl = buildCloudinaryDownloadUrl(document.fileUrl);
      const fileName = buildDownloadFileName(document.title, document.format);
      await downloadDocumentToDevice({ url: downloadUrl, fileName });
      Alert.alert(
        "Tải xuống thành công",
        `Tệp “${fileName}” đã được lưu vào thư mục bạn chọn.`,
      );
    } catch (downloadError) {
      Alert.alert(
        "Không thể tải tài liệu",
        downloadError instanceof Error
          ? downloadError.message
          : "Đã xảy ra lỗi khi lưu tài liệu vào thiết bị.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const openOriginalFile = async () => {
    if (!document?.fileUrl) return;

    try {
      const canOpen = await Linking.canOpenURL(document.fileUrl);
      if (!canOpen) {
        throw new Error("Thiết bị không hỗ trợ URL này.");
      }
      await Linking.openURL(document.fileUrl);
    } catch (openError) {
      Alert.alert(
        "Không thể mở tài liệu",
        openError instanceof Error
          ? openError.message
          : "Không thể mở URL của tài liệu.",
      );
    }
  };

  const shareFile = async () => {
    if (!document?.fileUrl) return;
    await Share.share({
      title: document.title,
      message: `${document.title}\n${document.fileUrl}`,
      url: document.fileUrl,
    });
  };

  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-outline-variant bg-surface px-4 py-4">
          <Pressable
            accessibilityRole="button"
            className="-ml-2 rounded-full p-2"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={22} color="#191b23" />
          </Pressable>
          <View className="flex-row items-center gap-2">
            {document?.author.id === user?.id ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit document"
                className="rounded-full p-2"
                onPress={() => {
                  if (document) {
                    router.push(ROUTES.DOCUMENT_EDIT(document.id) as never);
                  }
                }}
              >
                <MaterialIcons name="edit" size={22} color="#191b23" />
              </Pressable>
            ) : null}
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center gap-3 px-6">
            <ActivityIndicator />
            <Text className="text-sm text-on-surface-variant">
              Đang tải chi tiết tài liệu...
            </Text>
          </View>
        ) : error || !document ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-sm leading-6 text-error">
              {error ?? "Không tìm thấy tài liệu."}
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 112,
              }}
              showsVerticalScrollIndicator={false}
            >
              <DocumentPreview document={document} />

              <View className="mt-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                <View className="flex-row items-center gap-3">
                  <View className="rounded-xl bg-primary/10 p-3">
                    <MaterialIcons
                      name="description"
                      size={28}
                      color="#004ac6"
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      className="font-semibold text-on-surface"
                      numberOfLines={1}
                    >
                      {buildDownloadFileName(document.title, document.format)}
                    </Text>
                    <Text className="mt-1 text-sm text-on-surface-variant">
                      {document.format.toUpperCase()} ·{" "}
                      {formatBytes(document.sizeInBytes)}
                    </Text>
                  </View>
                </View>
                <View className="mt-4">
                  <Button
                    fullWidth
                    variant="outline"
                    onPress={() => void openOriginalFile()}
                    leftIcon={
                      <MaterialIcons
                        name="open-in-new"
                        size={18}
                        color="#191b23"
                      />
                    }
                  >
                    Xem chi tiết tài liệu
                  </Button>
                </View>
              </View>

              <View className="mt-6 gap-6">
                <View>
                  <Text className="text-2xl font-bold leading-8 text-on-surface">
                    {document.title}
                  </Text>
                  <View className="mt-4 flex-row flex-wrap items-center gap-x-6 gap-y-3">
                    <View className="flex-row items-center gap-2">
                      <View className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant bg-surface-variant" />
                      <Text className="text-sm font-semibold text-on-surface">
                        {document.author.name}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons
                        name="calendar-today"
                        size={18}
                        color="#434655"
                      />
                      <Text className="text-sm text-on-surface-variant">
                        {formatDate(document.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="border-t border-outline-variant pt-6">
                  <Text className="text-xl font-semibold text-on-surface">
                    Mô tả tài liệu
                  </Text>
                  <Text className="mt-3 text-base leading-7 text-on-surface-variant">
                    {document.description || "Tài liệu chưa có mô tả."}
                  </Text>
                  {document.subject ? (
                    <View className="mt-4 flex-row flex-wrap gap-2">
                      <Text className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-sm text-on-surface-variant">
                        {document.subject.name}
                      </Text>
                      <Text className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-sm text-on-surface-variant">
                        {document.subject.code}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0">
              <DocumentBottomActionBar
                downloadLabel={`Tải tài liệu (${formatBytes(document.sizeInBytes)})`}
                isDownloading={isDownloading}
                onDownload={() => void downloadFile()}
                onShare={() => void shareFile()}
              />
            </View>
          </>
        )}
      </View>
    </PageShell>
  );
}
