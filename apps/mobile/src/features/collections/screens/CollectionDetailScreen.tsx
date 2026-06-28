import { Icon } from "@/components/nativewindui/Icon";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  fetchCollectionDetail,
  removeDocumentFromCollection,
} from "../services/collections.service";
import type { CollectionDetail } from "../types/collection.types";

export function CollectionDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const collectionId = useMemo(() => {
    const value = params.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params.id]);

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(collectionId));
  const [error, setError] = useState<string | null>(
    collectionId ? null : "Thiếu mã bộ sưu tập.",
  );
  const [removingDocumentId, setRemovingDocumentId] = useState<string | null>(
    null,
  );

  const loadCollection = useCallback(async () => {
    if (!collectionId) return;

    setIsLoading(true);
    setError(null);
    try {
      const detail = await fetchCollectionDetail(collectionId);
      setCollection(detail);
    } catch {
      setCollection(null);
      setError("Không thể tải chi tiết bộ sưu tập.");
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void loadCollection();
  }, [loadCollection]);

  const removeDocument = (documentId: string) => {
    if (!collectionId) return;

    Alert.alert("Xóa khỏi bộ sưu tập", "Bạn muốn bỏ tài liệu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setRemovingDocumentId(documentId);
          removeDocumentFromCollection(collectionId, documentId)
            .then(() => {
              setCollection((current) =>
                current
                  ? {
                      ...current,
                      documents: current.documents.filter(
                        (document) => document.id !== documentId,
                      ),
                      documentCount: Math.max(0, current.documentCount - 1),
                    }
                  : current,
              );
            })
            .catch(() => Alert.alert("Không thể xóa", "Vui lòng thử lại sau."))
            .finally(() => setRemovingDocumentId(null));
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
            Chi tiết bộ sưu tập
          </Text>
          <View className="rounded-3xl bg-primary/10 p-3">
            <Icon
              materialIcon={{ name: "library-books" }}
              size={22}
              color="#004ac6"
            />
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center gap-3 px-6">
            <ActivityIndicator />
            <Text className="text-sm text-on-surface-variant">
              Đang tải bộ sưu tập...
            </Text>
          </View>
        ) : error || !collection ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-sm leading-6 text-error">
              {error ?? "Không tìm thấy bộ sưu tập."}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => void loadCollection()}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            <Card>
              <Text className="text-2xl font-bold text-on-surface">
                {collection.name}
              </Text>
              <Text className="mt-2 text-sm text-on-surface-variant">
                {collection.documentCount} tài liệu ·{" "}
                {collection.isPublic ? "Public" : "Private"}
              </Text>
              {collection.description ? (
                <Text className="mt-3 text-sm leading-6 text-on-surface-variant">
                  {collection.description}
                </Text>
              ) : null}
            </Card>

            <View className="mt-5 gap-3">
              {collection.documents.length === 0 ? (
                <Card>
                  <Text className="text-sm leading-6 text-on-surface-variant">
                    Bộ sưu tập này chưa có tài liệu.
                  </Text>
                </Card>
              ) : (
                collection.documents.map((document) => (
                  <Card key={document.id}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        router.push(
                          ROUTES.DOCUMENT_DETAIL(document.id) as never,
                        )
                      }
                    >
                      <Text
                        className="text-base font-semibold text-on-surface"
                        numberOfLines={2}
                      >
                        {document.title}
                      </Text>
                      <Text className="mt-1 text-sm text-on-surface-variant">
                        {document.subject?.name ?? "Chưa phân loại"} ·{" "}
                        {document.author.name}
                      </Text>
                    </Pressable>
                    <View className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        loading={removingDocumentId === document.id}
                        onPress={() => removeDocument(document.id)}
                      >
                        Xóa khỏi bộ sưu tập
                      </Button>
                    </View>
                  </Card>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </PageShell>
  );
}
