import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useTemplateFeature } from "../hooks/useTemplateFeature";
import type { TemplateFeatureItem } from "../types/template.types";
import {
  setTemplateFeatureSelectedItemId,
  useTemplateFeatureStore,
} from "@/store/template-feature.store";
import { Button, Card, PageShell, SearchBar } from "@/components";

const TemplateFeatureListItem = ({
  item,
  isSelected,
  onPress,
}: {
  item: TemplateFeatureItem;
  isSelected: boolean;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-2xl border p-4 ${
        isSelected
          ? "border-primary bg-secondary-container"
          : "border-outline-variant bg-surface-container-lowest"
      }`}
    >
      <Text className="text-base font-semibold text-on-surface">
        {item.title}
      </Text>
      <Text className="mt-1 text-sm text-on-surface-variant">
        {item.description}
      </Text>
      <Text className="mt-2 text-xs text-on-surface-variant">
        Updated: {item.updatedAt}
      </Text>
    </Pressable>
  );
};

export const TemplateFeatureScreen = () => {
  const { items, isLoading, errorMessage, hasData, loadItems } =
    useTemplateFeature();
  const { selectedItemId } = useTemplateFeatureStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return (
    <PageShell>
      <View className="flex-1 gap-4">
        <Text className="text-2xl font-bold text-on-surface">
          Template Feature
        </Text>
        <Text className="text-sm leading-6 text-on-surface-variant">
          Screen này chỉ chịu trách nhiệm render UI. Logic lấy dữ liệu nằm ở
          hook, API nằm ở services, và shared selection nằm ở store.
        </Text>

        <SearchBar
          label="Filter items"
          placeholder="Lọc theo tiêu đề hoặc mô tả..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onClear={() => setSearchTerm("")}
        />

        <Card
          title="Actions"
          subtitle="Ví dụ dùng lại Button trong feature screen."
        >
          <View className="flex-row flex-wrap gap-3">
            <Button onPress={() => void loadItems()}>Reload</Button>
            <Button variant="outline" onPress={() => setSearchTerm("")}>
              Clear search
            </Button>
          </View>
        </Card>

        {isLoading ? (
          <View className="items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <ActivityIndicator size="large" color="#004ac6" />
            <Text className="mt-3 text-sm text-on-surface-variant">
              Đang tải dữ liệu...
            </Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View className="rounded-2xl border border-error-container bg-error-container p-4">
            <Text className="text-sm text-on-error-container">
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {!isLoading && !hasData ? (
          <View className="rounded-2xl border border-dashed border-outline-variant p-4">
            <Text className="text-sm text-on-surface-variant">
              Chưa có dữ liệu. Có thể bắt đầu với mock service hoặc kết nối API
              thật.
            </Text>
          </View>
        ) : null}

        <FlatList
          className="flex-1 mt-2"
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TemplateFeatureListItem
              item={item}
              isSelected={selectedItemId === item.id}
              onPress={() => setTemplateFeatureSelectedItemId(item.id)}
            />
          )}
        />
      </View>
    </PageShell>
  );
};
