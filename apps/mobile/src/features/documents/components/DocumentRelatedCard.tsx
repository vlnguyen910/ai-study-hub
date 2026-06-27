import { Icon } from "@/components/nativewindui/Icon";
import { Image, Pressable, Text, View } from "react-native";
import type { RelatedDocumentItem } from "../types/document.types";

interface DocumentRelatedCardProps {
  readonly item: RelatedDocumentItem;
  readonly onPress: () => void;
}

export function DocumentRelatedCard({
  item,
  onPress,
}: DocumentRelatedCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row gap-3 rounded-2xl border border-outline-variant bg-surface p-3"
    >
      <Image
        accessibilityLabel={item.title}
        source={{ uri: item.previewUrl }}
        className="h-20 w-16 rounded-xl bg-surface-container-highest"
      />
      <View className="flex-1 justify-between py-0.5">
        <Text
          className="text-sm font-semibold leading-5 text-on-surface"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <View className="mt-2 flex-row items-center justify-between gap-2">
          <Text className="text-xs text-on-surface-variant">{item.author}</Text>
          <View className="flex-row items-center gap-1">
            <Icon name="square.and.arrow.down" size={14} color="#434655" />
            <Text className="text-xs text-on-surface-variant">
              {item.downloads}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
