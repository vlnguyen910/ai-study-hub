import { Text, View } from "react-native";
import type { DocumentDetailStat } from "../types/document-review.types";

interface DocumentStatCardProps {
  readonly stat: DocumentDetailStat;
  readonly helperText?: string;
  readonly highlight?: boolean;
}

export function DocumentStatCard({
  stat,
  helperText,
  highlight = false,
}: DocumentStatCardProps) {
  return (
    <View className="rounded-2xl border border-outline-variant bg-surface-container-low p-3">
      <Text className="mb-1 text-[11px] uppercase tracking-wider text-on-surface-variant">
        {stat.label}
      </Text>
      {highlight ? (
        <View className="flex-row items-center gap-1">
          <View className="h-2 w-2 rounded-full bg-primary" />
          <Text className="text-sm font-semibold text-on-surface">
            {stat.value}
          </Text>
        </View>
      ) : (
        <Text className="text-sm font-semibold text-on-surface">
          {stat.value}
        </Text>
      )}
      {helperText ? (
        <Text className="mt-1 text-xs text-on-surface-variant">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
