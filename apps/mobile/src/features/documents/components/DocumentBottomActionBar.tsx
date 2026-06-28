import { Icon } from "@/components/nativewindui/Icon";
import { Pressable, View } from "react-native";
import { Button } from "@/components";

interface DocumentBottomActionBarProps {
  readonly onShare: () => void;
  readonly onDownload: () => void;
  readonly downloadLabel: string;
  readonly isDownloading?: boolean;
}

export function DocumentBottomActionBar({
  onShare,
  onDownload,
  downloadLabel,
  isDownloading = false,
}: DocumentBottomActionBarProps) {
  return (
    <View className="border-t border-outline-variant/70 bg-surface-container-lowest px-4 py-4 shadow-lg shadow-black/10">
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={onShare}
          className="h-12 w-12 items-center justify-center rounded-full border border-outline-variant bg-surface"
          style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
        >
          <Icon name="square.and.arrow.up" size={20} color="#191b23" />
        </Pressable>
        <View className="flex-1">
          <Button
            fullWidth
            onPress={onDownload}
            loading={isDownloading}
            leftIcon={
              <Icon name="square.and.arrow.down" size={18} color="#ffffff" />
            }
          >
            {downloadLabel}
          </Button>
        </View>
      </View>
    </View>
  );
}
