import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Button } from "@/components";

interface DocumentBottomActionBarProps {
  readonly onShare: () => void;
  readonly onDownload: () => void;
  readonly downloadLabel: string;
}

export function DocumentBottomActionBar({
  onShare,
  onDownload,
  downloadLabel,
}: DocumentBottomActionBarProps) {
  return (
    <View className="border-t border-outline-variant bg-surface px-4 py-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={onShare}
          className="h-12 w-12 items-center justify-center rounded-2xl border border-outline-variant bg-surface"
        >
          <MaterialIcons name="share" size={20} color="#191b23" />
        </Pressable>
        <View className="flex-1">
          <Button
            fullWidth
            onPress={onDownload}
            leftIcon={
              <MaterialIcons name="download" size={18} color="#ffffff" />
            }
          >
            {downloadLabel}
          </Button>
        </View>
      </View>
    </View>
  );
}
