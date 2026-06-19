import { RefreshControl, ScrollView, Text, View } from "react-native";

import { PageShell } from "@/components";
import { ActiveDocumentsFeed } from "@/features/documents/components/ActiveDocumentsFeed";
import { useActiveDocuments } from "@/features/documents/hooks/useActiveDocuments";

export default function LibraryRoute() {
  const { documents, isLoading, error, reload } = useActiveDocuments(20);

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
          <View className="gap-2">
            <Text className="text-2xl font-bold text-on-surface">
              Document library
            </Text>
            <Text className="text-sm leading-6 text-on-surface-variant">
              Public, approved documents loaded from the API.
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
