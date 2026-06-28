import { Icon } from "@/components/nativewindui/Icon";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button, Card, PageShell } from "@/components";
import { ROUTES } from "@/constants/routes";
import {
  createCollection,
  deleteCollection,
  fetchCollections,
  updateCollection,
} from "../services/collections.service";
import type { CollectionSummary } from "../types/collection.types";

export function CollectionsListScreen() {
  const [collections, setCollections] = useState<readonly CollectionSummary[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchCollections({ page: 1, limit: 100 });
      setCollections(response.collections);
    } catch {
      setCollections([]);
      setError("Không thể tải bộ sưu tập. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isCreating) return;

    setIsCreating(true);
    setError(null);
    try {
      const collection = await createCollection({
        name: trimmedName,
        description: description.trim() || undefined,
        isPublic,
      });
      setCollections((current) => [collection, ...current]);
      setName("");
      setDescription("");
      setIsPublic(false);
    } catch {
      setError("Tạo bộ sưu tập thất bại. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (collection: CollectionSummary) => {
    setEditingId(collection.id);
    setEditName(collection.name);
    setEditDescription(collection.description ?? "");
    setEditIsPublic(collection.isPublic);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim() || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      const updated = await updateCollection(editingId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        isPublic: editIsPublic,
      });
      setCollections((current) =>
        current.map((collection) =>
          collection.id === updated.id
            ? { ...collection, ...updated }
            : collection,
        ),
      );
      setEditingId(null);
    } catch {
      Alert.alert("Không thể cập nhật", "Vui lòng thử lại sau.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDelete = (collection: CollectionSummary) => {
    Alert.alert(
      "Xóa bộ sưu tập",
      `Bạn có chắc muốn xóa “${collection.name}”?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            deleteCollection(collection.id)
              .then(() =>
                setCollections((current) =>
                  current.filter((item) => item.id !== collection.id),
                ),
              )
              .catch(() =>
                Alert.alert("Không thể xóa", "Vui lòng thử lại sau."),
              );
          },
        },
      ],
    );
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
            Bộ sưu tập của tôi
          </Text>
          <View className="rounded-3xl bg-primary/10 p-3">
            <Icon
              materialIcon={{ name: "bookmark" }}
              size={22}
              color="#004ac6"
            />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void loadCollections()}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <Card
            title="Tạo bộ sưu tập mới"
            subtitle="Gom tài liệu theo chủ đề học tập của bạn."
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
              <TextInput
                className="min-h-[82px] rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-base text-on-surface"
                placeholder="Mô tả ngắn (không bắt buộc)"
                placeholderTextColor="#737686"
                value={description}
                multiline
                textAlignVertical="top"
                onChangeText={setDescription}
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
                onPress={() => void handleCreate()}
              >
                Tạo bộ sưu tập
              </Button>
            </View>
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
                    Đang tải bộ sưu tập...
                  </Text>
                </View>
              </Card>
            ) : collections.length === 0 ? (
              <Card>
                <Text className="text-sm leading-6 text-on-surface-variant">
                  Bạn chưa có bộ sưu tập nào.
                </Text>
              </Card>
            ) : (
              collections.map((collection) => {
                const isEditing = editingId === collection.id;
                return (
                  <Card key={collection.id}>
                    {isEditing ? (
                      <View className="gap-3">
                        <TextInput
                          className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-base text-on-surface"
                          value={editName}
                          onChangeText={setEditName}
                        />
                        <TextInput
                          className="min-h-[72px] rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-base text-on-surface"
                          value={editDescription}
                          multiline
                          textAlignVertical="top"
                          onChangeText={setEditDescription}
                        />
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm font-semibold text-on-surface">
                            Công khai
                          </Text>
                          <Switch
                            value={editIsPublic}
                            onValueChange={setEditIsPublic}
                          />
                        </View>
                        <View className="flex-row gap-3">
                          <View className="flex-1">
                            <Button
                              fullWidth
                              variant="outline"
                              onPress={() => setEditingId(null)}
                            >
                              Hủy
                            </Button>
                          </View>
                          <View className="flex-1">
                            <Button
                              fullWidth
                              loading={isSavingEdit}
                              onPress={() => void saveEdit()}
                            >
                              Lưu
                            </Button>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          router.push(
                            ROUTES.COLLECTION_DETAIL(collection.id) as never,
                          )
                        }
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="min-w-0 flex-1">
                            <Text
                              className="text-base font-semibold text-on-surface"
                              numberOfLines={2}
                            >
                              {collection.name}
                            </Text>
                            <Text className="mt-1 text-xs text-on-surface-variant">
                              {collection.documentCount} tài liệu ·{" "}
                              {collection.isPublic ? "Public" : "Private"}
                            </Text>
                            {collection.description ? (
                              <Text
                                className="mt-2 text-sm leading-6 text-on-surface-variant"
                                numberOfLines={2}
                              >
                                {collection.description}
                              </Text>
                            ) : null}
                          </View>
                          <Icon
                            name="chevron.right"
                            size={18}
                            color="#737686"
                          />
                        </View>
                        <View className="mt-4 flex-row gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => startEdit(collection)}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onPress={() => confirmDelete(collection)}
                          >
                            Xóa
                          </Button>
                        </View>
                      </Pressable>
                    )}
                  </Card>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </PageShell>
  );
}
