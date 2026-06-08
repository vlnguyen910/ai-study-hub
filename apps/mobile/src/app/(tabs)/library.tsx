import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { Card, PageShell } from "@/components";
import { fetchDocuments } from "@/features/documents/services/documents.service";
import type { LibraryDocument } from "@/features/documents/types/document.types";

const statusLabel: Record<string, string> = {
  ACTIVE: "Đang hiển thị",
  PENDING: "Chờ duyệt",
  REJECTED: "Bị từ chối",
};

export default function LibraryTab() {
  const [documents, setDocuments] = useState<readonly LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchDocuments({ page: 1, limit: 20 })
      .then((response) => {
        if (!mounted) return;
        setDocuments(response.documents);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setDocuments([]);
        setError("Không thể tải thư viện tài liệu.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-on-surface">
              Thư viện tài liệu
            </Text>
            <Text className="text-sm leading-6 text-on-surface-variant">
              Tài liệu công khai được tải trực tiếp từ hệ thống.
            </Text>
          </View>

          {isLoading ? (
            <Card>
              <View className="items-center gap-3 py-8">
                <ActivityIndicator />
                <Text className="text-sm text-on-surface-variant">
                  Đang tải tài liệu...
                </Text>
              </View>
            </Card>
          ) : error ? (
            <Card>
              <Text className="text-sm leading-6 text-error">{error}</Text>
            </Card>
          ) : documents.length === 0 ? (
            <Card>
              <Text className="text-sm leading-6 text-on-surface-variant">
                Hiện chưa có tài liệu công khai.
              </Text>
            </Card>
          ) : (
            <View className="gap-3">
              {documents.map((document) => (
                <Link
                  key={document.id}
                  href={
                    `/(templates)/document-detail?id=${document.id}` as never
                  }
                >
                  <View className="rounded-2xl border border-outline-variant bg-surface p-4">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Text className="text-base font-semibold leading-6 text-on-surface">
                          {document.title}
                        </Text>
                        <Text className="text-sm text-on-surface-variant">
                          {document.subject?.name ?? "Chưa phân loại"}
                        </Text>
                      </View>
                      <Text className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {statusLabel[document.status] ?? document.status}
                      </Text>
                    </View>
                    <Text className="mt-3 text-xs text-on-surface-variant">
                      {document.author.name}
                    </Text>
                  </View>
                </Link>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </PageShell>
  );
}
