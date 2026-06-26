import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { PageShell, SearchBar } from "@/components";
import { ActiveDocumentsFeed } from "@/features/documents/components/ActiveDocumentsFeed";
import { useActiveDocuments } from "@/features/documents/hooks/useActiveDocuments";

export default function SearchRoute() {
  const [query, setQuery] = useState("");
  const { documents, isLoading, error, reload } = useActiveDocuments(50);
  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return documents;

    return documents.filter((document) =>
      [document.title, document.author.name, document.subject?.name]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [documents, query]);

  return (
    <PageShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
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
              Search documents
            </Text>
            <Text className="text-sm leading-6 text-on-surface-variant">
              Search active documents by title, author, or subject.
            </Text>
          </View>

          <SearchBar
            label="Search"
            placeholder="Algorithms, calculus, author..."
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery("")}
          />

          <ActiveDocumentsFeed
            documents={filteredDocuments}
            isLoading={isLoading}
            error={error}
            emptyMessage={
              query.trim()
                ? `No active documents match “${query.trim()}”.`
                : undefined
            }
            onRetry={() => void reload()}
          />
        </View>
      </ScrollView>
    </PageShell>
  );
}
