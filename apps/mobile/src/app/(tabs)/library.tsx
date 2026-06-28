import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { PageShell } from "@/components";
import { Icon } from "@/components/nativewindui/Icon";
import { ActiveDocumentsFeed } from "@/features/documents/components/ActiveDocumentsFeed";
import {
  fetchDocuments,
  fetchSubjects,
} from "@/features/documents/services/documents.service";
import type {
  LibraryDocument,
  Subject,
} from "@/features/documents/types/document.types";

export default function LibraryRoute() {
  const [documents, setDocuments] = useState<readonly LibraryDocument[]>([]);
  const [subjects, setSubjects] = useState<readonly Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = useCallback(async () => {
    setIsLoadingSubjects(true);
    try {
      const response = await fetchSubjects(100);
      setSubjects(response.subjects);
    } catch {
      setSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  }, []);

  const loadDocuments = useCallback(
    async (subjectId = selectedSubjectId) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchDocuments({
          page: 1,
          limit: 20,
          status: "ACTIVE",
          subjectId: subjectId || undefined,
        });
        setDocuments(
          response.documents.filter((document) => document.status === "ACTIVE"),
        );
      } catch {
        setDocuments([]);
        setError("Không thể tải thư viện tài liệu. Kéo xuống để thử lại.");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedSubjectId],
  );

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    void loadDocuments(selectedSubjectId);
  }, [loadDocuments, selectedSubjectId]);

  const selectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  return (
    <PageShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              void loadSubjects();
              void loadDocuments();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          <View className="overflow-hidden rounded-[32px] border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm shadow-black/5">
            <View className="flex-row items-start gap-4">
              <View className="rounded-3xl bg-primary/10 p-4">
                <Icon
                  materialIcon={{ name: "local-library" }}
                  size={28}
                  color="#004ac6"
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Library
                </Text>
                <Text className="mt-2 text-2xl font-bold text-on-surface">
                  Thư viện tài liệu
                </Text>
                <Text className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Tài liệu public đã duyệt, lọc trực tiếp theo môn học từ API.
                </Text>
              </View>
            </View>
          </View>

          <View className="rounded-3xl border border-outline-variant/80 bg-surface-container-lowest p-4 shadow-sm shadow-black/5">
            <Text className="text-sm font-semibold text-on-surface">
              Bộ lọc môn học
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 8,
                paddingRight: 8,
                paddingTop: 12,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedSubjectId === "" }}
                className={`rounded-full border px-4 py-2 ${
                  selectedSubjectId === ""
                    ? "border-primary bg-primary-container"
                    : "border-outline-variant bg-surface"
                }`}
                onPress={() => selectSubject("")}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedSubjectId === ""
                      ? "text-on-primary-container"
                      : "text-on-surface-variant"
                  }`}
                >
                  Tất cả
                </Text>
              </Pressable>

              {subjects.map((subject) => {
                const active = selectedSubjectId === subject.id;
                return (
                  <Pressable
                    key={subject.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    className={`rounded-full border px-4 py-2 ${
                      active
                        ? "border-primary bg-primary-container"
                        : "border-outline-variant bg-surface"
                    }`}
                    onPress={() => selectSubject(subject.id)}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        active
                          ? "text-on-primary-container"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {subject.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {isLoadingSubjects ? (
              <Text className="text-xs text-on-surface-variant">
                Đang tải danh sách môn học...
              </Text>
            ) : subjects.length === 0 ? (
              <Text className="text-xs text-on-surface-variant">
                Chưa tải được danh sách môn học. Thư viện vẫn hiển thị tất cả.
              </Text>
            ) : null}
          </View>

          <ActiveDocumentsFeed
            documents={documents}
            isLoading={isLoading}
            error={error}
            onRetry={() => void loadDocuments()}
          />
        </View>
      </ScrollView>
    </PageShell>
  );
}
