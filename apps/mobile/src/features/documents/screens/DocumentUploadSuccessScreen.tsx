import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Button, PageShell } from "@/components";
import { ROUTES } from "@/constants/routes";

export function DocumentUploadSuccessScreen() {
  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 items-center justify-center bg-background px-6 py-8">
        <View className="w-full max-w-md rounded-[32px] border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-sm">
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Text className="text-3xl">✓</Text>
          </View>

          <Text className="text-2xl font-bold tracking-tight text-on-surface">
            Tải lên tài liệu thành công
          </Text>
          <Text className="mt-3 text-sm leading-6 text-on-surface-variant">
            Tài liệu của bạn đã được đăng lên và đang chờ hệ thống xử lý. Bạn có
            thể xem lại danh sách tài liệu của mình ngay bây giờ.
          </Text>

          <View className="mt-6 gap-3">
            <Button
              fullWidth
              onPress={() => router.replace(ROUTES.MY_DOCUMENTS as never)}
            >
              Xem tài liệu của tôi
            </Button>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace(ROUTES.DOCUMENT_UPLOAD as never)}
              className="items-center rounded-full px-4 py-3"
            >
              <Text className="text-sm font-semibold text-primary">
                Tải lên thêm tài liệu
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </PageShell>
  );
}
