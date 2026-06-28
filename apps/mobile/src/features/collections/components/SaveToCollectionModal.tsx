import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button, Card } from "@/components";
import {
  addDocumentToCollection,
  createCollection,
  fetchCollections,
  removeDocumentFromCollection,
} from "../services/collections.service";
import type { CollectionSummary } from "../types/collection.types";

interface SaveToCollectionModalProps {
  readonly visible: boolean;
  readonly documentId: string;
  readonly onClose: () => void;
}

export function SaveToCollectionModal({
  visible,
  documentId,
  onClose,
}: SaveToCollectionModalProps) {
  const [collections, setCollections] = useState<readonly CollectionSummary[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null,
  );
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchCollections({
        page: 1,
        limit: 100,
        documentId,
      });
      setCollections(response.collections);
    } catch {
      setCollections([]);
      setError("Không thể tải bộ sưu tập. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (visible) {
      void loadCollections();
    }
  }, [loadCollections, visible]);

  const toggleCollection = async (collection: CollectionSummary) => {
    if (activeCollectionId) return;

    setActiveCollectionId(collection.id);
    setError(null);
    try {
      if (collection.containsDocument) {
        await removeDocumentFromCollection(collection.id, documentId);
      } else {
        await addDocumentToCollection(collection.id, documentId);
      }

      setCollections((current) =>
        current.map((item) =>
          item.id === collection.id
            ? {
                ...item,
                containsDocument: !collection.containsDocument,
                documentCount: Math.max(
                  0,
                  item.documentCount + (collection.containsDocument ? -1 : 1),
                ),
              }
            : item,
        ),
      );
    } catch {
      Alert.alert("Không thể cập nhật", "Vui lòng thử lại sau.");
    } finally {
      setActiveCollectionId(null);
    }
  };

  const createAndSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isCreating) return;

    setIsCreating(true);
    setError(null);
    try {
      const collection = await createCollection({
        name: trimmedName,
        isPublic,
        documentId,
      });
      setCollections((current) => [
        { ...collection, containsDocument: true },
        ...current,
      ]);
      setName("");
      setIsPublic(false);
    } catch {
      setError("Tạo bộ sưu tập thất bại. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[86%] rounded-t-3xl bg-surface px-4 pb-6 pt-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold text-on-surface">
                Lưu vào bộ sưu tập
              </Text>
              <Text className="mt-1 text-sm text-on-surface-variant">
                Chọn một hoặc nhiều bộ sưu tập cho tài liệu này.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              className="rounded-full bg-surface-container px-3 py-2"
              onPress={onClose}
            >
              <Text className="text-base font-bold text-on-surface">×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-3">
              {isLoading ? (
                <Card>
                  <View className="items-center gap-3 py-6">
                    <ActivityIndicator />
                    <Text className="text-sm text-on-surface-variant">
                      Đang tải bộ sưu tập...
                    </Text>
                  </View>
                </Card>
              ) : collections.length === 0 ? (
                <Card>
                  <Text className="text-sm leading-6 text-on-surface-variant">
                    Bạn chưa có bộ sưu tập nào. Tạo mới bên dưới để lưu tài liệu
                    này.
                  </Text>
                </Card>
              ) : (
                collections.map((collection) => (
                  <Pressable
                    key={collection.id}
                    accessibilityRole="button"
                    className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
                    onPress={() => void toggleCollection(collection)}
                  >
                    <View className="flex-row items-center justify-between gap-4">
                      <View className="min-w-0 flex-1">
                        <Text
                          className="text-base font-semibold text-on-surface"
                          numberOfLines={1}
                        >
                          {collection.name}
                        </Text>
                        <Text className="mt-1 text-xs text-on-surface-variant">
                          {collection.documentCount} tài liệu ·{" "}
                          {collection.isPublic ? "Public" : "Private"}
                        </Text>
                      </View>
                      {activeCollectionId === collection.id ? (
                        <ActivityIndicator />
                      ) : (
                        <Switch
                          value={Boolean(collection.containsDocument)}
                          onValueChange={() =>
                            void toggleCollection(collection)
                          }
                        />
                      )}
                    </View>
                  </Pressable>
                ))
              )}

              <Card
                className="mt-2"
                title="Tạo mới bộ sưu tập"
                subtitle="Bộ sưu tập mới sẽ lưu tài liệu hiện tại ngay lập tức."
              >
                <View className="gap-3">
                  <TextInput
                    className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-base text-on-surface"
                    placeholder="Tên bộ sưu tập"
                    placeholderTextColor="#737686"
                    value={name}
                    maxLength={80}
                    onChangeText={setName}
                  />
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-on-surface">
                      Công khai
                    </Text>
                    <Switch value={isPublic} onValueChange={setIsPublic} />
                  </View>
                  <Button
                    fullWidth
                    loading={isCreating}
                    disabled={!name.trim()}
                    onPress={() => void createAndSave()}
                  >
                    Tạo và lưu tài liệu
                  </Button>
                </View>
              </Card>

              {error ? (
                <Text className="text-sm leading-6 text-error">{error}</Text>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
