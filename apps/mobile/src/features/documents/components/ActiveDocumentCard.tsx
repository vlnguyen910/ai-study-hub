import { Icon } from "@/components/nativewindui/Icon";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ROUTES } from "@/constants/routes";
import type { LibraryDocument } from "../types/document.types";

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

export function ActiveDocumentCard({
  document,
}: {
  readonly document: LibraryDocument;
}) {
  return (
    <Link href={ROUTES.DOCUMENT_DETAIL(document.id) as never} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${document.title}`}
        className="overflow-hidden rounded-3xl border border-outline-variant/80 bg-surface-container-lowest shadow-sm shadow-black/5"
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
        <View className="h-2 bg-primary" />
        <View className="p-4">
          <View className="flex-row items-start gap-3">
            <View className="rounded-2xl bg-primary/10 p-3">
              <Icon
                materialIcon={{ name: "article" }}
                size={24}
                color="#004ac6"
              />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text
                className="text-base font-bold leading-6 text-on-surface"
                numberOfLines={2}
              >
                {document.title}
              </Text>
              <View className="mt-1 flex-row flex-wrap items-center gap-2">
                <Text
                  className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface-variant"
                  numberOfLines={1}
                >
                  {document.subject?.name ?? "Chưa phân loại"}
                </Text>
                {document.format ? (
                  <Text className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                    {document.format}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3 border-t border-outline-variant/60 pt-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-secondary-container">
                <Icon
                  materialIcon={{ name: "person" }}
                  size={14}
                  color="#03497a"
                />
              </View>
              <Text
                className="min-w-0 flex-1 text-xs font-medium text-on-surface-variant"
                numberOfLines={1}
              >
                {document.author.name}
              </Text>
            </View>
            <Text className="text-xs font-semibold text-on-surface-variant">
              {formatDate(document.createdAt)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
