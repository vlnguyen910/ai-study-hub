import { useMemo, useState } from "react";
import { Icon } from "@/components/nativewindui/Icon";
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
import { ROUTES } from "@/constants/routes";
import { DocumentFilterChip } from "../components/DocumentFilterChip";
import { ReviewDocumentCard } from "../components/ReviewDocumentCard";
import type {
  ReviewDocumentSummary,
  ReviewQueueFilter,
} from "../types/document-review.types";

const filters: ReviewQueueFilter[] = [
  { label: "Pending Review", value: "pending" },
  { label: "High Urgency", value: "urgent" },
  { label: "Computer Science", value: "computer-science" },
  { label: "Mathematics", value: "mathematics" },
];

const reviewDocuments: ReviewDocumentSummary[] = [
  {
    id: "doc-1",
    title:
      "Advanced Algorithms for Quantum Computing Applications in Cryptography",
    author: "by Dr. Elena Rostova",
    uploadedAt: "2h ago",
    fileType: "PDF",
    fileSize: "2.4MB",
    description:
      "This paper explores the theoretical limits of current post-quantum cryptographic methods against Shor's algorithm variants...",
    category: "Computer Science",
    categoryKey: "computer-science",
  },
  {
    id: "doc-2",
    title:
      "Introduction to Machine Learning: Neural Networks and Deep Learning Fundamentals",
    author: "by Prof. Alan Turing",
    uploadedAt: "4h ago",
    fileType: "DOCX",
    fileSize: "1.1MB",
    description:
      "A comprehensive guide for beginners outlining the basic architecture of perceptrons and backpropagation algorithms...",
    category: "Mathematics",
    categoryKey: "mathematics",
  },
  {
    id: "doc-3",
    title: "Report on Academic Integrity Policy Violations Q3",
    author: "by Admin",
    uploadedAt: "5h ago",
    fileType: "PDF",
    fileSize: "500KB",
    description:
      "High-priority review item flagged by the moderation workflow for immediate inspection and action.",
    category: "Computer Science",
    categoryKey: "computer-science",
    priority: "high",
  },
];

const scrollContentStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 32,
};

const filterRowStyle: StyleProp<ViewStyle> = {
  gap: 8,
  paddingBottom: 16,
};

export function DocumentReviewScreen() {
  const [selectedFilter, setSelectedFilter] = useState(filters[0].value);

  const filteredDocuments = useMemo(() => {
    if (selectedFilter === "pending") {
      return reviewDocuments;
    }

    if (selectedFilter === "urgent") {
      return reviewDocuments.filter((document) => document.priority === "high");
    }

    return reviewDocuments.filter(
      (document) => document.categoryKey === selectedFilter,
    );
  }, [selectedFilter]);

  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between border-b border-outline-variant bg-surface px-4 py-4">
          <Text className="text-2xl font-bold tracking-tight text-primary">
            AcademiShare
          </Text>
          <View className="flex-row items-center gap-4">
            <Pressable
              accessibilityRole="button"
              className="rounded-full p-2"
              onPress={() => {}}
            >
              <Icon
                materialIcon={{ name: "filter-list" }}
                sfSymbol={{ name: "line.3.horizontal.decrease" as any }}
                size={22}
                color="#434655"
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="rounded-full p-2"
              onPress={() => {}}
            >
              <Icon name="bell" size={22} color="#434655" />
            </Pressable>
            <Image
              accessibilityLabel="Moderator avatar"
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOdq3b_ELYMC3GxquZ7RauzvzJ1pHpMfQQrorUfffyd_17r085qf5-VDo_tbKXmF7wHmykjJTozbpZ1TVNWoFmCwhZDY1dnPGSwk2XO-8bo-kYFGg-_BZqDhSl37KgNuJRR8jaqk4y-7pWYY09g8q--SUumhwSPTxLbMb5m84GyF68wDcKUE1AsUixdGwr9QeL4zaC2sAvFTWbPk0oMt2v9Rd-qCdCDR0sJUgAjYmwtjT5NJnGazypV9ma9i_j8OnIIMkdTuQ34E0",
              }}
              className="h-8 w-8 rounded-full border border-outline-variant"
            />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={scrollContentStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={filterRowStyle}
          >
            {filters.map((filter) => (
              <View key={filter.value} className="mr-2">
                <DocumentFilterChip
                  label={filter.label}
                  active={selectedFilter === filter.value}
                  onPress={() => setSelectedFilter(filter.value)}
                />
              </View>
            ))}
          </ScrollView>

          <View className="gap-4">
            {filteredDocuments.map((document) => (
              <ReviewDocumentCard
                key={document.id}
                document={document}
                onReject={() => {}}
                onSeeDetail={() =>
                  router.push(
                    ROUTES.MODERATOR_DOCUMENT_DETAIL(document.id) as never,
                  )
                }
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </PageShell>
  );
}
