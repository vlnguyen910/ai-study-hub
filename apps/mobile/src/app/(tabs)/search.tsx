import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Switch, Text, View } from "react-native";

import { Button, PageShell, SearchBar } from "@/components";
import { Icon } from "@/components/nativewindui/Icon";
import { ActiveDocumentsFeed } from "@/features/documents/components/ActiveDocumentsFeed";
import { fetchDocuments } from "@/features/documents/services/documents.service";
import type { LibraryDocument } from "@/features/documents/types/document.types";

export default function SearchRoute() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isSemantic, setIsSemantic] = useState(false);
  const [documents, setDocuments] = useState<readonly LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(
    async (nextQuery = submittedQuery, nextIsSemantic = isSemantic) => {
      setIsLoading(true);
      setError(null);

      try {
        const normalizedQuery = nextQuery.trim();
        const response = await fetchDocuments({
          page: 1,
          limit: 50,
          status: "ACTIVE",
          search: normalizedQuery || undefined,
          isSemantic: normalizedQuery ? nextIsSemantic : undefined,
        });
        setDocuments(
          response.documents.filter((document) => document.status === "ACTIVE"),
        );
      } catch {
        setDocuments([]);
        setError("Không thể tìm kiếm tài liệu. Kéo xuống hoặc thử lại.");
      } finally {
        setIsLoading(false);
      }
    },
    [isSemantic, submittedQuery],
  );

  useEffect(() => {
    void loadDocuments("", false);
    // Only bootstrap once; subsequent searches are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSearch = () => {
    const normalizedQuery = query.trim();
    setSubmittedQuery(normalizedQuery);
    void loadDocuments(normalizedQuery, isSemantic);
  };

  const toggleSemanticSearch = (value: boolean) => {
    setIsSemantic(value);
    if (submittedQuery.trim()) {
      void loadDocuments(submittedQuery, value);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
    void loadDocuments("", false);
  };

  return (
    <PageShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => void loadDocuments()}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          <View className="overflow-hidden rounded-[32px] border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm shadow-black/5">
            <View className="flex-row items-start gap-4">
              <View className="rounded-3xl bg-primary/10 p-4">
                <Icon
                  materialIcon={{ name: "manage-search" }}
                  size={28}
                  color="#004ac6"
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  AI Search
                </Text>
                <Text className="mt-2 text-2xl font-bold text-on-surface">
                  Tìm kiếm tài liệu
                </Text>
                <Text className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Tìm theo từ khóa hoặc bật ngữ nghĩa AI để khớp theo ý tưởng
                  nội dung.
                </Text>
              </View>
            </View>
          </View>

          <View className="gap-3">
            <SearchBar
              label="Từ khóa"
              placeholder="Thuật toán, calculus, tác giả..."
              value={query}
              returnKeyType="search"
              onChangeText={setQuery}
              onSubmitEditing={submitSearch}
              onClear={clearSearch}
            />

            <View className="rounded-3xl border border-outline-variant/80 bg-surface-container-lowest p-4 shadow-sm shadow-black/5">
              <View className="flex-row items-center justify-between gap-4">
                <View className="min-w-0 flex-1 flex-row items-start gap-3">
                  <View className="rounded-2xl bg-secondary-container p-3">
                    <Icon
                      materialIcon={{ name: "psychology" }}
                      size={20}
                      color="#03497a"
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-bold text-on-surface">
                      Tìm kiếm ngữ nghĩa bằng AI
                    </Text>
                    <Text className="mt-1 text-xs leading-5 text-on-surface-variant">
                      Bật khi bạn muốn tìm theo ý nghĩa nội dung, không chỉ khớp
                      chữ trong tiêu đề.
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isSemantic}
                  onValueChange={toggleSemanticSearch}
                />
              </View>
            </View>

            <Button
              fullWidth
              loading={isLoading}
              leftIcon={
                <Icon
                  materialIcon={{ name: "search" }}
                  size={18}
                  color="#fff"
                />
              }
              onPress={submitSearch}
            >
              Tìm kiếm
            </Button>
          </View>

          <ActiveDocumentsFeed
            documents={documents}
            isLoading={isLoading}
            error={error}
            emptyMessage={
              submittedQuery.trim()
                ? `Không có tài liệu phù hợp với “${submittedQuery.trim()}”.`
                : undefined
            }
            onRetry={() => void loadDocuments()}
          />
        </View>
      </ScrollView>
    </PageShell>
  );
}
