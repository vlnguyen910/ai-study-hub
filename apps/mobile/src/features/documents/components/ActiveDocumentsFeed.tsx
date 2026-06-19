import { ActivityIndicator, Text, View } from "react-native";

import { Button, Card } from "@/components";
import type { LibraryDocument } from "../types/document.types";
import { ActiveDocumentCard } from "./ActiveDocumentCard";

interface ActiveDocumentsFeedProps {
  readonly documents: readonly LibraryDocument[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly onRetry: () => void;
  readonly emptyMessage?: string;
}

export function ActiveDocumentsFeed({
  documents,
  isLoading,
  error,
  onRetry,
  emptyMessage = "No active documents are available yet.",
}: ActiveDocumentsFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <View className="items-center gap-3 py-8">
          <ActivityIndicator />
          <Text className="text-sm text-on-surface-variant">
            Loading active documents...
          </Text>
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <View className="items-start gap-4">
          <Text className="text-sm leading-6 text-error">{error}</Text>
          <Button variant="outline" size="sm" onPress={onRetry}>
            Try again
          </Button>
        </View>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <Text className="text-sm leading-6 text-on-surface-variant">
          {emptyMessage}
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      {documents.map((document) => (
        <ActiveDocumentCard key={document.id} document={document} />
      ))}
    </View>
  );
}
