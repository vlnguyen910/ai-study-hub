import { Icon } from "@/components/nativewindui/Icon";
import { Text, View } from "react-native";
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
    <View className="overflow-hidden rounded-3xl border border-outline-variant/80 bg-surface-container-lowest shadow-sm shadow-black/5">
      <View className={`h-2 ${hasPriority ? "bg-error" : "bg-primary"}`} />
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 flex-row items-start gap-2">
            {hasPriority ? (
              <View className="rounded-full bg-error/10 p-2">
                <Icon
                  materialIcon={{ name: "priority-high" }}
                  size={16}
                  color="#ba1a1a"
                />
              </View>
            ) : (
              <View className="rounded-full bg-primary/10 p-2">
                <Icon
                  materialIcon={{ name: "article" }}
                  size={16}
                  color="#004ac6"
                />
              </View>
            )}
            <View className="flex-1">
              <Text className="mb-1 text-base font-bold leading-6 text-on-surface">
                {document.title}
              </Text>
              <Text className="text-sm text-on-surface-variant">
                {document.author} • Uploaded {document.uploadedAt}
              </Text>
            </View>
          </View>
          <Text className="rounded-full border border-outline-variant bg-surface-container-high px-3 py-1 text-xs font-bold text-on-surface-variant">
            {document.fileType} • {document.fileSize}
          </Text>
        </View>

        <View className="mt-4 rounded-3xl border border-outline-variant/70 bg-surface-container-low p-4">
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
    </View>
  );
}
