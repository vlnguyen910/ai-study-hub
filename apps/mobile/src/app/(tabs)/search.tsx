import { Text, View } from "react-native";
import { Button, Card, PageShell, SearchBar } from "@/components";

export default function SearchTab() {
  return (
    <PageShell>
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-on-surface">Search</Text>
          <Text className="text-sm leading-6 text-on-surface-variant">
            Đây là tab mẫu để dùng SearchBar và các card kết quả.
          </Text>
        </View>

        <SearchBar placeholder="Tìm kiếm nội dung..." />

        <Card title="Suggested filters">
          <View className="gap-3">
            <Button variant="secondary" size="sm" onPress={() => {}}>
              Study plans
            </Button>
            <Button variant="ghost" size="sm" onPress={() => {}}>
              Recent docs
            </Button>
          </View>
        </Card>
      </View>
    </PageShell>
  );
}
