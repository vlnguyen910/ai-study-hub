import { Icon } from "@/components/nativewindui/Icon";
import { useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { useDocumentText } from "../hooks/useDocumentText";
import type { DocumentDetail } from "../types/document.types";
import {
  buildEmbeddedPreviewUrl,
  getDocumentPreviewType,
  shouldFetchRawTextPreview,
} from "../utils/document-preview";

interface DocumentPreviewProps {
  readonly document: Pick<
    DocumentDetail,
    "fileUrl" | "pdfPreviewUrl" | "format" | "title" | "extractedText"
  >;
}

function PreviewMessage({ message }: { readonly message: string }) {
  return (
    <View className="h-72 items-center justify-center gap-3 bg-surface-container-low px-6">
      <Icon name="eye" size={42} color="#737686" />
      <Text className="text-center text-sm leading-6 text-on-surface-variant">
        {message}
      </Text>
    </View>
  );
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const previewType = getDocumentPreviewType(document.format);
  const [webPreviewError, setWebPreviewError] = useState(false);
  const extractedText = document.extractedText?.trim() ?? "";
  const shouldLoadRawText = shouldFetchRawTextPreview(
    document.format,
    extractedText,
  );
  const textPreview = useDocumentText(document.fileUrl, shouldLoadRawText);

  const renderPreview = () => {
    if (previewType === "image") {
      return (
        <Image
          accessibilityLabel={`Xem trước ${document.title}`}
          source={{ uri: document.fileUrl }}
          className="h-[420px] w-full bg-black/5"
          resizeMode="contain"
        />
      );
    }

    if (previewType === "text") {
      if (extractedText) {
        return (
          <View className="max-h-[480px] bg-white p-4">
            <Text selectable className="font-mono text-sm leading-6 text-black">
              {extractedText}
            </Text>
          </View>
        );
      }

      if (textPreview.isLoading) {
        return (
          <View className="h-72 items-center justify-center gap-3">
            <ActivityIndicator />
            <Text className="text-sm text-on-surface-variant">
              Đang tải bản xem trước...
            </Text>
          </View>
        );
      }

      if (textPreview.error) {
        return <PreviewMessage message={textPreview.error} />;
      }

      return (
        <View className="max-h-[480px] bg-white p-4">
          <Text selectable className="font-mono text-sm leading-6 text-black">
            {textPreview.text ||
              "Chưa có nội dung văn bản đã trích xuất cho tài liệu này."}
          </Text>
        </View>
      );
    }

    if (previewType === "pdf" || previewType === "office") {
      if (webPreviewError) {
        return (
          <PreviewMessage message="Không thể tải bản xem trước. Bạn vẫn có thể dùng nút “Xem chi tiết tài liệu” bên dưới." />
        );
      }

      const urlToLoad = document.pdfPreviewUrl || document.fileUrl;
      const typeToLoad = document.pdfPreviewUrl ? "pdf" : previewType;

      return (
        <WebView
          testID="document-preview-webview"
          source={{
            uri: buildEmbeddedPreviewUrl(urlToLoad, typeToLoad),
          }}
          style={{ height: 500, backgroundColor: "#ffffff" }}
          nestedScrollEnabled
          originWhitelist={["https://*", "http://*"]}
          renderLoading={() => (
            <View className="absolute inset-0 items-center justify-center gap-3 bg-white">
              <ActivityIndicator />
              <Text className="text-sm text-on-surface-variant">
                Đang dựng bản xem trước...
              </Text>
            </View>
          )}
          startInLoadingState
          onError={() => setWebPreviewError(true)}
          onHttpError={() => setWebPreviewError(true)}
        />
      );
    }

    return (
      <PreviewMessage
        message={`Chưa hỗ trợ xem trước định dạng ${document.format.toUpperCase()}.`}
      />
    );
  };

  return (
    <View className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
      <View className="flex-row items-center justify-between border-b border-outline-variant bg-surface-container-high px-4 py-3">
        <Text className="font-semibold text-on-surface">
          Xem trước tài liệu
        </Text>
        <Text className="text-xs font-semibold uppercase text-primary">
          {document.format}
        </Text>
      </View>
      {renderPreview()}
    </View>
  );
}
