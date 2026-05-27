import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { PageShell } from "@/components";
import { DocumentBottomActionBar } from "../components/DocumentBottomActionBar";
import { DocumentRelatedCard } from "../components/DocumentRelatedCard";
import type { DocumentDetailInfo } from "../types/document.types";

const documentDetail: DocumentDetailInfo = {
  id: "doc-structure-001",
  title: "Cấu trúc Dữ liệu và Giải thuật: Hướng dẫn Toàn diện",
  author: "Nguyễn Văn A",
  publishedAt: "12 Thg 10, 2023",
  views: "4.2k lượt xem",
  downloads: "850 lượt tải",
  fileType: "PDF",
  fileSize: "2.4 MB",
  description: [
    "Tài liệu này cung cấp một cái nhìn sâu sắc về các cấu trúc dữ liệu cơ bản và nâng cao, cùng với các thuật toán cốt lõi trong khoa học máy tính.",
    "Bao gồm các ví dụ thực tế và mã nguồn minh họa bằng ngôn ngữ C++ và Python.",
  ],
  tags: ["Khoa học Máy tính", "Lập trình", "Thuật toán"],
  previewUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDsCgWTLdwfMETw1p8JCJqlAAH3-XYOgZfQ6FlFJhwX7yycXKJFeyBMnPHhdituUL10MhffB9C0QloQcB4EYTWwxSQWz2CUlX3hbjrnXHcqtGCyCUP8erl2xyiaEAQwwq7pGtelNU4oc3oyuM7tEjRLYsGEnpMlclESj_Z2OAUVLOupurj63znsgj4QbcIaCdBzdIyu0quk7uXudDY3nm7tOMP6OtUB3jL0rBjhnm_8ajTeO5oO7DmewSlGCEuldwtnJ6a8IHPxHH4",
  relatedDocuments: [
    {
      id: "related-1",
      title: "Lập trình Hướng đối tượng với Java",
      author: "Trần Thị B",
      downloads: "520",
      previewUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBOe9x2JFugjqOcspI5qZdr8jrDEnBEMnPV1Qx7kL8cjQ9Fdg4Fr3O3wSzRhP81pmJV5GHrEAiTQmpg2_kh-XuDmGqR_mL_DlLL9-IOCD-ktZboZK6uBDGMlq0TE7ZU7PFknrRxWssYoY2Q8PkGS9olqkxmRTmCy2iYjAuhUW08eAaGrv6a8LaVPv_6ojyjtfNzcf2wi5PpFI0gHEU9motCyK8d8fY_rMHJBKBJgpZ9UUVFn9VUTILc3bLNHNU_RvDcX2k76UJpK7A",
    },
    {
      id: "related-2",
      title: "Nhập môn Cơ sở dữ liệu Quan hệ",
      author: "Lê Văn C",
      downloads: "1.2k",
      previewUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCzBy3OqSbLq3OQDKspyhvLRl7w76oxcHbI3EUnnpH7h6sjgC2GiqhxvOPY7a4E7E9IRn3OJ8BZoiW42FPengZld4Fw2fdgcxCJpCzm8mRDIw1o-1NrfF4RPJJlWgRBiTejzSWjR-fF1LRhdIN8a_ZhGYt3JKJy5XT4PxvibRiS6t19EWxEHeuFbnwF1zkyprIamlgGRdQpvoWtQI5d9Pq7UU9nk1W6Tzg9jLSL960cWt7rMsEdZRDavJqlR7AU_T5sdtFJrudDYWM",
    },
  ],
};

export function DocumentDetailScreen() {
  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-outline-variant bg-surface px-4 py-4">
          <Pressable
            accessibilityRole="button"
            className="-ml-2 rounded-full p-2"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={22} color="#191b23" />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              className="rounded-full p-2"
              onPress={() => {}}
            >
              <MaterialIcons name="bookmark-border" size={22} color="#191b23" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="rounded-full p-2"
              onPress={() => {}}
            >
              <MaterialIcons name="more-vert" size={22} color="#191b23" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 112,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
            <View className="relative aspect-[3/4] bg-surface-container-highest">
              <Image
                accessibilityLabel="Bản xem trước tài liệu"
                source={{ uri: documentDetail.previewUrl }}
                className="h-full w-full"
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
                  <MaterialIcons name="fullscreen" size={18} color="#ffffff" />
                  <Text className="text-sm font-semibold text-on-primary">
                    Xem toàn màn hình
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View className="mt-6 gap-6">
            <View>
              <Text className="text-2xl font-bold leading-8 text-on-surface">
                {documentDetail.title}
              </Text>
              <View className="mt-4 flex-row flex-wrap items-center gap-x-6 gap-y-3">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant bg-surface-variant" />
                  <Text className="text-sm font-semibold text-on-surface">
                    {documentDetail.author}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5 text-on-surface-variant">
                  <MaterialIcons
                    name="calendar-today"
                    size={18}
                    color="#434655"
                  />
                  <Text className="text-sm text-on-surface-variant">
                    {documentDetail.publishedAt}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons name="visibility" size={18} color="#434655" />
                  <Text className="text-sm text-on-surface-variant">
                    {documentDetail.views}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons name="download" size={18} color="#434655" />
                  <Text className="text-sm text-on-surface-variant">
                    {documentDetail.downloads}
                  </Text>
                </View>
              </View>
            </View>

            <View className="border-t border-outline-variant pt-6">
              <Text className="text-xl font-semibold text-on-surface">
                Mô tả tài liệu
              </Text>
              <View className="mt-3 gap-4">
                {documentDetail.description.map((paragraph) => (
                  <Text
                    key={paragraph}
                    className="text-base leading-7 text-on-surface-variant"
                  >
                    {paragraph}
                  </Text>
                ))}
              </View>
              <View className="mt-4 flex-row flex-wrap gap-2">
                {documentDetail.tags.map((tag) => (
                  <Text
                    key={tag}
                    className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-sm text-on-surface-variant"
                  >
                    {tag}
                  </Text>
                ))}
              </View>
            </View>

            <View className="gap-4 border-t border-outline-variant pt-6">
              <Text className="text-xl font-semibold text-on-surface">
                Tài liệu liên quan
              </Text>
              <View className="gap-3">
                {documentDetail.relatedDocuments.map((item) => (
                  <DocumentRelatedCard
                    key={item.id}
                    item={item}
                    onPress={() => {}}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0">
          <DocumentBottomActionBar
            downloadLabel={`Tải về (${documentDetail.fileSize})`}
            onDownload={() => {}}
            onShare={() => {}}
          />
        </View>
      </View>
    </PageShell>
  );
}
