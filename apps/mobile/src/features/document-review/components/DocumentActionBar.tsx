import { Icon } from "@/components/nativewindui/Icon";
import { View } from "react-native";
import { Button } from "@/components";

interface DocumentActionBarProps {
  readonly onReject: () => void;
  readonly onApprove: () => void;
}

export function DocumentActionBar({
  onReject,
  onApprove,
}: DocumentActionBarProps) {
  return (
    <View className="border-t border-outline-variant bg-surface-container-lowest px-4 pt-4">
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Button variant="outline" fullWidth onPress={onReject}>
            Từ chối
          </Button>
        </View>
        <View className="flex-1">
          <Button
            fullWidth
            leftIcon={
              <Icon name="checkmark.circle" size={18} color="#ffffff" />
            }
            onPress={onApprove}
          >
            Phê duyệt
          </Button>
        </View>
      </View>
    </View>
  );
}
