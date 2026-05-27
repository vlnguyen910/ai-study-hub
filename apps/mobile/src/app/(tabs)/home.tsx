import { useState } from "react";
import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Button, Card, PageShell, SearchBar } from "@/components";

type RouteLink = {
  label: string;
  href: string;
};

const tabRoutes: RouteLink[] = [
  { label: "Home tab", href: "/home" },
  { label: "Search tab", href: "/search" },
  { label: "Library tab", href: "/library" },
];

const templateRoutes: RouteLink[] = [
  { label: "Feature template", href: "/(templates)/feature-template" },
  { label: "Auth login", href: "/(templates)/auth-login" },
  { label: "Auth register", href: "/(templates)/auth-register" },
  {
    label: "Auth forgot password",
    href: "/(templates)/auth-forgot-password",
  },
  {
    label: "Document upload",
    href: "/(templates)/document-upload",
  },
  {
    label: "Document detail",
    href: "/(templates)/document-detail",
  },
  {
    label: "Document edit",
    href: "/(templates)/document-edit",
  },
  {
    label: "Moderator document review",
    href: "/(templates)/moderator-document-review",
  },
  {
    label: "Moderator document detail",
    href: "/(templates)/moderator-document-detail",
  },
];

const devRouteGroups = [
  { title: "Tab routes", routes: tabRoutes },
  { title: "Template routes", routes: templateRoutes },
] as const;

function RouteGroup({ title, routes }: { title: string; routes: RouteLink[] }) {
  return (
    <Card title={title} subtitle="Chỉ hiện trong chế độ dev.">
      <View className="gap-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href as never}
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base font-semibold text-primary"
          >
            {route.label}
          </Link>
        ))}
      </View>
    </Card>
  );
}

export default function HomeTab() {
  const [query, setQuery] = useState("");
  const isDevMode = __DEV__;

  return (
    <PageShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-on-surface">
              Mobile component hub
            </Text>
            <Text className="text-base leading-6 text-on-surface-variant">
              Bộ component dùng chung cho mobile được dựng theo cùng bảng màu
              với web globals.css.
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

              <Link
                href={"/(templates)/profile" as never}
                className="text-base font-semibold text-primary"
              >
                Mở Profile cá nhân
              </Link>
            </View>
          </Card>

          {isDevMode ? (
            <View className="gap-4">
              {devRouteGroups.map((group) => (
                <RouteGroup
                  key={group.title}
                  title={group.title}
                  routes={group.routes}
                />
              ))}
            </View>
          ) : (
            <Card
              title="Component hub"
              subtitle="Danh sách đường dẫn chỉ hiện trong chế độ dev."
            >
              <Text className="text-sm leading-6 text-on-surface-variant">
                Màn này được giữ gọn trong bản production để tránh lộ toàn bộ
                route nội bộ.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </PageShell>
  );
}
