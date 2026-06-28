import { Icon } from "@/components/nativewindui/Icon";
import { router } from "expo-router";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { Button, PageShell } from "@/components";
import { ROUTES } from "@/constants/routes";
import { EmailVerificationBanner } from "@/features/auth/components/EmailVerificationBanner";
import { useSession } from "@/features/auth/context/SessionContext";
import { ActiveDocumentsFeed } from "../components/ActiveDocumentsFeed";
import { useActiveDocuments } from "../hooks/useActiveDocuments";

export function HomeScreen() {
  const { isAuthenticated } = useSession();
  const { documents, isLoading, error, reload } = useActiveDocuments(10);

  return (
    <PageShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => void reload()}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          {isAuthenticated ? <EmailVerificationBanner /> : null}

          <View className="overflow-hidden rounded-[32px] bg-primary shadow-lg shadow-primary/25">
            <View className="absolute -right-12 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <View className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-secondary/20" />
            <View className="px-5 py-7">
              <View className="mb-5 self-start rounded-full bg-white/15 px-4 py-2">
                <Text className="text-xs font-bold uppercase tracking-[0.18em] text-on-primary">
                  AI Study Hub
                </Text>
              </View>
              <Text className="text-3xl font-bold leading-10 text-on-primary">
                Học nhanh hơn từ tài liệu cộng đồng
              </Text>
              <Text className="mt-3 text-base leading-6 text-on-primary/85">
                Tìm kiếm, đọc, tóm tắt AI và lưu tài liệu vào bộ sưu tập cá nhân
                của bạn.
              </Text>
            </View>
            <View className="px-5 pb-7">
              <View className="flex-row flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onPress={() => router.push(ROUTES.LIBRARY as never)}
                  leftIcon={
                    <Icon
                      materialIcon={{ name: "local-library" }}
                      size={18}
                      color="#191b23"
                    />
                  }
                >
                  Browse library
                </Button>
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    onPress={() => router.push(ROUTES.DOCUMENT_UPLOAD as never)}
                    leftIcon={
                      <Icon
                        materialIcon={{ name: "upload-file" }}
                        size={18}
                        color="#191b23"
                      />
                    }
                  >
                    Upload document
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onPress={() => router.push(ROUTES.LOGIN as never)}
                    leftIcon={
                      <Icon
                        materialIcon={{ name: "person" }}
                        size={18}
                        color="#191b23"
                      />
                    }
                  >
                    Login
                  </Button>
                )}
              </View>
            </View>
          </View>

          <View className="gap-1">
            <Text className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Mới cập nhật
            </Text>
            <Text className="text-2xl font-bold text-on-surface">
              Tài liệu đang hoạt động
            </Text>
            <Text className="text-sm leading-6 text-on-surface-variant">
              Chỉ hiển thị tài liệu đã được duyệt và đang public.
            </Text>
          </View>

          <ActiveDocumentsFeed
            documents={documents}
            isLoading={isLoading}
            error={error}
            onRetry={() => void reload()}
          />
        </View>
      </ScrollView>
    </PageShell>
  );
}
