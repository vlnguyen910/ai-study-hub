import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ROUTES } from "@/constants/routes";
import type { LibraryDocument } from "../types/document.types";

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
        className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
        style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
      >
        <View className="flex-row items-start gap-3">
          <View className="rounded-xl bg-primary/10 p-3">
            <MaterialIcons name="description" size={24} color="#004ac6" />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text
              className="text-base font-semibold leading-6 text-on-surface"
              numberOfLines={2}
            >
              {document.title}
            </Text>
            <Text className="text-sm text-on-surface-variant" numberOfLines={1}>
              {document.subject?.name ?? "Uncategorized"}
            </Text>
            <View className="mt-2 flex-row items-center justify-between gap-3">
              <Text
                className="min-w-0 flex-1 text-xs text-on-surface-variant"
                numberOfLines={1}
              >
                {document.author.name}
              </Text>
              <Text className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Active
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
