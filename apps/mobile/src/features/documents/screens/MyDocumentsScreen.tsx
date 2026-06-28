import { Icon } from "@/components/nativewindui/Icon";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Button, Card, PageShell } from "@/components";
import { ROUTES } from "@/constants/routes";
import {
  deleteDocument,
  fetchMyDocuments,
} from "../services/documents.service";
import type { DocumentStatus, LibraryDocument } from "../types/document.types";

const statusLabel: Record<DocumentStatus, string> = {
  ACTIVE: "Đã duyệt",
  PENDING: "Chờ duyệt",
  REJECTED: "Từ chối",
  DELETED: "Đã xóa",
};

const statusClasses: Record<DocumentStatus, string> = {
  ACTIVE: "bg-primary/10 text-primary",
  PENDING: "bg-secondary-container text-on-secondary-container",
  REJECTED: "bg-error/10 text-error",
  DELETED: "bg-surface-container text-on-surface-variant",
};

export function MyDocumentsScreen() {
  const [documents, setDocuments] = useState<readonly LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchMyDocuments({ page: 1, limit: 100 });
      setDocuments(response.documents);
    } catch {
      setDocuments([]);
      setError("Không thể tải tài liệu của bạn. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const confirmDelete = (document: LibraryDocument) => {
    Alert.alert("Xóa tài liệu", `Bạn có chắc muốn xóa “${document.title}”?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setDeletingId(document.id);
          deleteDocument(document.id)
            .then(() =>
              setDocuments((current) =>
                current.filter((item) => item.id !== document.id),
              ),
            )
            .catch(() => Alert.alert("Không thể xóa", "Vui lòng thử lại sau."))
            .finally(() => setDeletingId(null));
        },
      },
    ]);
  };

  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 bg-background">
        <View className="flex-row items-center border-b border-outline-variant/70 bg-surface-container-lowest px-4 py-4">
          <Pressable
            accessibilityRole="button"
            className="-ml-1 rounded-full bg-surface-container-high p-3"
            onPress={() => router.back()}
          >
            <Icon name="chevron.left" size={20} color="#191b23" />
          </Pressable>
          <Text className="ml-3 flex-1 text-xl font-bold text-on-surface">
            Tài liệu của tôi
          </Text>
          <View className="rounded-3xl bg-primary/10 p-3">
            <Icon
              materialIcon={{ name: "article" }}
              size={22}
              color="#004ac6"
            />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void loadDocuments()}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <Card
            title="Tài liệu đã tải lên"
            subtitle="Theo dõi trạng thái duyệt và chỉnh sửa nhanh tài liệu của bạn."
          >
            <Button
              variant="outline"
              onPress={() => router.push(ROUTES.DOCUMENT_UPLOAD as never)}
            >
              Tải lên tài liệu mới
            </Button>
          </Card>

          {error ? (
            <Text className="mt-4 text-sm leading-6 text-error">{error}</Text>
          ) : null}

          <View className="mt-5 gap-3">
            {isLoading ? (
              <Card>
                <View className="items-center gap-3 py-8">
                  <ActivityIndicator />
                  <Text className="text-sm text-on-surface-variant">
                    Đang tải tài liệu...
                  </Text>
                </View>
              </Card>
            ) : documents.length === 0 ? (
              <Card>
                <Text className="text-sm leading-6 text-on-surface-variant">
                  Bạn chưa tải lên tài liệu nào.
                </Text>
              </Card>
            ) : (
              documents.map((document) => (
                <Card key={document.id}>
                  <Text
                    className="text-base font-semibold text-on-surface"
                    numberOfLines={2}
                  >
                    {document.title}
                  </Text>
                  <View className="mt-2 flex-row flex-wrap items-center gap-2">
                    <Text
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClasses[document.status]
                      }`}
                    >
                      {statusLabel[document.status]}
                    </Text>
                    <Text className="text-xs text-on-surface-variant">
                      {document.subject?.name ?? "Chưa phân loại"}
                    </Text>
                  </View>
                  {document.rejectionReason ? (
                    <Text className="mt-3 text-sm leading-6 text-error">
                      Lý do từ chối: {document.rejectionReason}
                    </Text>
                  ) : null}

                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() =>
                        router.push(
                          ROUTES.DOCUMENT_DETAIL(document.id) as never,
                        )
                      }
                    >
                      Xem
                    </Button>
                    <Button
                      size="sm"
                      onPress={() =>
                        router.push(ROUTES.DOCUMENT_EDIT(document.id) as never)
                      }
                    >
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={deletingId === document.id}
                      onPress={() => confirmDelete(document)}
                    >
                      Xóa
                    </Button>
                  </View>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </PageShell>
  );
}
