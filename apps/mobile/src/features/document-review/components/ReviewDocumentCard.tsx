import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import { Button } from "@/components";
import type { ReviewDocumentSummary } from "../types/document-review.types";

interface ReviewDocumentCardProps {
  readonly document: ReviewDocumentSummary;
  readonly onReject: () => void;
  readonly onSeeDetail: () => void;
}

export function ReviewDocumentCard({
  document,
  onReject,
  onSeeDetail,
}: ReviewDocumentCardProps) {
  const hasPriority = document.priority === "high";

  return (
    <View className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-start gap-2">
          {hasPriority ? (
            <MaterialIcons name="priority-high" size={20} color="#ba1a1a" />
          ) : null}
          <View className="flex-1">
            <Text className="mb-1 text-base font-semibold leading-6 text-on-surface">
              {document.title}
            </Text>
            <Text className="text-sm text-on-surface-variant">
              {document.author} • Uploaded {document.uploadedAt}
            </Text>
          </View>
        </View>
        <Text className="rounded-md border border-outline-variant bg-surface-container-high px-2 py-1 text-xs font-semibold text-on-surface-variant">
          {document.fileType} • {document.fileSize}
        </Text>
      </View>

      <View className="mt-3 rounded-2xl border border-outline-variant bg-surface-container-low p-3">
        <Text className="text-sm leading-6 text-on-surface-variant">
          {document.description}
        </Text>
      </View>

      <View className="mt-4 flex-row gap-2">
        <View className="flex-1">
          <Button variant="outline" fullWidth onPress={onReject}>
            Reject
          </Button>
        </View>
        <View className="flex-1">
          <Button fullWidth onPress={onSeeDetail}>
            See Detail
          </Button>
        </View>
      </View>
    </View>
  );
}
