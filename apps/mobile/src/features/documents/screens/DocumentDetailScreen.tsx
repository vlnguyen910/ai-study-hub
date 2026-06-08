import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { PageShell } from "@/components";
import { DocumentBottomActionBar } from "../components/DocumentBottomActionBar";
import { fetchDocumentDetail } from "../services/documents.service";
import type { DocumentDetail } from "../types/document.types";

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

  const openFile = async () => {
    if (!document?.fileUrl) return;
    await Linking.openURL(document.fileUrl);
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
            <Pressable
              accessibilityRole="button"
              className="rounded-full p-2"
              onPress={() => {
                if (document?.id) {
                  router.push(
                    `/(templates)/document-edit?id=${document.id}` as never,
                  );
                }
              }}
            >
              <MaterialIcons name="edit" size={22} color="#191b23" />
            </Pressable>
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
              <View className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8">
                <View className="items-center gap-4">
                  <MaterialIcons name="description" size={56} color="#004ac6" />
                  <Text className="text-sm font-semibold uppercase text-primary">
                    {document.format}
                  </Text>
                  <Text className="text-sm text-on-surface-variant">
                    {formatBytes(document.sizeInBytes)}
                  </Text>
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
                downloadLabel={`Mở tệp (${formatBytes(document.sizeInBytes)})`}
                onDownload={openFile}
                onShare={() => {}}
              />
            </View>
          </>
        )}
      </View>
    </PageShell>
  );
}
