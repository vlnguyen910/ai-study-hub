import { useEffect } from "react";
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
      className={`mb-3 rounded-xl border p-4 ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
      }`}
    >
      <Text className="text-base font-semibold text-slate-900">
        {item.title}
      </Text>
      <Text className="mt-1 text-sm text-slate-600">{item.description}</Text>
      <Text className="mt-2 text-xs text-slate-500">
        Updated: {item.updatedAt}
      </Text>
    </Pressable>
  );
};

export const TemplateFeatureScreen = () => {
  const { items, isLoading, errorMessage, hasData, loadItems } =
    useTemplateFeature();
  const { selectedItemId } = useTemplateFeatureStore();

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return (
    <View className="flex-1 bg-white px-6 py-6">
      <Text className="text-2xl font-bold text-slate-900">
        Template Feature
      </Text>
      <Text className="mt-2 text-sm leading-6 text-slate-600">
        Screen này chỉ chịu trách nhiệm render UI. Logic lấy dữ liệu nằm ở hook,
        API nằm ở services, và shared selection nằm ở store.
      </Text>

      {isLoading ? (
        <View className="mt-8 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-3 text-sm text-slate-500">
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <Text className="text-sm text-rose-700">{errorMessage}</Text>
        </View>
      ) : null}

      {!isLoading && !hasData ? (
        <View className="mt-6 rounded-xl border border-dashed border-slate-300 p-4">
          <Text className="text-sm text-slate-600">
            Chưa có dữ liệu. Có thể bắt đầu với mock service hoặc kết nối API
            thật.
          </Text>
        </View>
      ) : null}

      <FlatList
        className="mt-6"
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
  );
};
