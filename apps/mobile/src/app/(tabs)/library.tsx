import { Text, View } from "react-native";
import { Button, Card, PageShell } from "@/components";

export default function LibraryTab() {
  return (
    <PageShell>
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-on-surface">Library</Text>
          <Text className="text-sm leading-6 text-on-surface-variant">
            Tab thứ ba để kiểm tra trạng thái active của bottom tab và tái sử
            dụng Button/Card.
          </Text>
        </View>

        <Card title="Saved items" subtitle="Chưa có dữ liệu mẫu trong tab này.">
          <Button onPress={() => {}}>Add new item</Button>
        </Card>
      </View>
    </PageShell>
  );
}
