import { useState } from "react";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { Button, Card, PageShell, SearchBar } from "@/components";

export default function HomeTab() {
  const [query, setQuery] = useState("");

  return (
    <PageShell>
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-on-surface">
            Mobile component hub
          </Text>
          <Text className="text-base leading-6 text-on-surface-variant">
            Bộ component dùng chung cho mobile được dựng theo cùng bảng màu với
            web globals.css.
          </Text>
        </View>

        <SearchBar
          label="Search demo"
          placeholder="Tìm tài liệu, khóa học, thẻ..."
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
        />

        <Card
          title="Reusable primitives"
          subtitle="Button, SearchBar, Card và BottomTabBar đều có thể dùng lại ở feature khác."
        >
          <View className="gap-3">
            <Button onPress={() => {}}>Primary action</Button>
            <Button variant="outline" onPress={() => {}}>
              Secondary action
            </Button>
            <Link
              href={"/(templates)/feature-template" as never}
              className="text-base font-semibold text-primary"
            >
              Đi tới feature template
            </Link>

            <Link
              href={"/(templates)/auth-login" as never}
              className="text-base font-semibold text-primary"
            >
              Đi tới auth login
            </Link>
          </View>
        </Card>
      </View>
    </PageShell>
  );
}
