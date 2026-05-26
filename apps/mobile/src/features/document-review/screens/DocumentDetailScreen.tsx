import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { PageShell } from "@/components";
import { DocumentActionBar } from "../components/DocumentActionBar";
import { DocumentStatCard } from "../components/DocumentStatCard";
import type { DocumentDetailData } from "../types/document-review.types";

const documentDetail: DocumentDetailData = {
  id: "doc-1",
  category: "Toán học nâng cao",
  year: "Năm 3",
  title: "Giải thuật Tối ưu hóa trong Kỹ thuật Điều khiển Tự động",
  author: "Nguyễn Văn A",
  submittedAt: "14/10/2023",
  fileType: "PDF",
  fileSize: "12.4 MB",
  pageCount: "45 trang",
  confidence: "Cao (98%)",
  description:
    "Tài liệu tổng hợp các thuật toán tối ưu hóa phổ biến như Gradient Descent, Genetic Algorithm và Particle Swarm Optimization áp dụng trong lĩnh vực Kỹ thuật Điều khiển. Nội dung bao gồm cả lý thuyết và ví dụ thực hành trên MATLAB.",
  previewUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCFoWOXE8BpehTpzK_VwlxYsYSozkY3M5_q_624ZCzkMDdOYJsdEmXDJoINCoPq9PJp5tIslERSkDwzJPze7sWqsxg9EKIEUhiruonMWrITciB_ZWnp44O2yYxHo1FhD5tVufgyQZIS9LpsawUO3lOhMVHMFmm_N_fM-x_4dVnOUFB_7mPFuyqwkjf7IvVYfQ1bEMXmxoTCk3sIjBggz0Mzt5A_VAQ_ctY_PwOgPFZY5Wkv1BJU3KzXE8Y2ujyjyJLlwZlexxrWA_4",
  stats: [
    { label: "Người tải lên", value: "Nguyễn Văn A" },
    { label: "Ngày gửi", value: "14/10/2023" },
    { label: "Số trang", value: "45 trang" },
    { label: "Độ tin cậy AI", value: "Cao (98%)" },
  ],
};

const scrollContentStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 128,
};

export function DocumentDetailScreen() {
  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 bg-surface">
        <View className="flex-row items-center border-b border-outline-variant bg-surface px-4 py-4">
          <Pressable
            accessibilityRole="button"
            className="-ml-2 rounded-full p-2"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={22} color="#191b23" />
          </Pressable>
          <Text className="ml-1 flex-1 text-xl font-bold tracking-tight text-on-surface">
            Kiểm duyệt tài liệu
          </Text>
          <Pressable
            accessibilityRole="button"
            className="rounded-full p-2"
            onPress={() => {}}
          >
            <MaterialIcons name="flag" size={22} color="#191b23" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
            <View className="relative aspect-[3/4] bg-surface-container">
              <Image
                accessibilityLabel="Document preview"
                source={{ uri: documentDetail.previewUrl }}
                className="h-full w-full opacity-90"
                resizeMode="cover"
              />
              <View className="absolute inset-0 items-center justify-center bg-white/70 px-6">
                <MaterialIcons name="description" size={52} color="#004ac6" />
                <Text className="mt-4 text-sm font-semibold text-on-surface-variant">
                  Tài liệu {documentDetail.fileType} - {documentDetail.fileSize}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  className="mt-4 flex-row items-center gap-2 rounded-full bg-primary px-6 py-3"
                  onPress={() => {}}
                >
                  <MaterialIcons name="zoom-in" size={18} color="#ffffff" />
                  <Text className="text-sm font-semibold text-on-primary">
                    Xem toàn bộ trang
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View className="mt-5 gap-6">
            <View>
              <View className="mb-2 flex-row flex-wrap gap-2">
                <Text className="rounded bg-secondary-container px-2 py-1 text-[10px] font-bold uppercase text-on-secondary-container">
                  {documentDetail.category}
                </Text>
                <Text className="rounded bg-surface-container-highest px-2 py-1 text-[10px] font-bold uppercase text-on-surface-variant">
                  {documentDetail.year}
                </Text>
              </View>
              <Text className="text-2xl font-bold leading-8 text-on-surface">
                {documentDetail.title}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {documentDetail.stats.map((stat, index) => (
                <View key={stat.label} className="w-[48%]">
                  <DocumentStatCard
                    stat={stat}
                    highlight={index === 3}
                    helperText={index === 3 ? undefined : undefined}
                  />
                </View>
              ))}
            </View>

            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-on-surface">
                Mô tả chi tiết
              </Text>
              <Text className="text-base leading-7 text-on-surface-variant">
                {documentDetail.description}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0">
          <DocumentActionBar onReject={() => {}} onApprove={() => {}} />
          <View className="h-4 bg-surface-container-lowest" />
        </View>
      </View>
    </PageShell>
  );
}
