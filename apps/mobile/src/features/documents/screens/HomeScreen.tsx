import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { Button, PageShell } from "@/components";
import { ROUTES } from "@/constants/routes";
import { EmailVerificationBanner } from "@/features/auth/components/EmailVerificationBanner";
import { useSession } from "@/features/auth/context/SessionContext";
import { ActiveDocumentsFeed } from "../components/ActiveDocumentsFeed";
import { useActiveDocuments } from "../hooks/useActiveDocuments";

export function HomeScreen() {
  const { isAuthenticated } = useSession();
  const { documents, isLoading, error, reload } = useActiveDocuments(10);

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
          {isAuthenticated ? <EmailVerificationBanner /> : null}

          <View className="rounded-3xl bg-primary px-5 py-6">
            <Text className="text-3xl font-bold leading-10 text-on-primary">
              Learn from documents shared by your community
            </Text>
            <Text className="mt-3 text-base leading-6 text-on-primary/85">
              Browse approved study material, open a document, and download it
              directly from Cloudinary.
            </Text>
            <View className="mt-5 flex-row flex-wrap gap-3">
              <Button
                variant="secondary"
                onPress={() => router.push(ROUTES.LIBRARY as never)}
                leftIcon={
                  <Ionicons name="library-outline" size={18} color="#191b23" />
                }
              >
                Browse library
              </Button>
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  onPress={() => router.push(ROUTES.DOCUMENT_UPLOAD as never)}
                >
                  Upload document
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onPress={() => router.push(ROUTES.LOGIN as never)}
                >
                  Login
                </Button>
              )}
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-2xl font-bold text-on-surface">
              Recently active documents
            </Text>
            <Text className="text-sm leading-6 text-on-surface-variant">
              Only documents with ACTIVE status are shown here.
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
