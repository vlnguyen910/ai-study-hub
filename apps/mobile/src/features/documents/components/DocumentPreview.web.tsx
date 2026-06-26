import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, Image, Text, View } from "react-native";

import { useDocumentText } from "../hooks/useDocumentText";
import type { DocumentDetail } from "../types/document.types";
import {
  buildEmbeddedPreviewUrl,
  getDocumentPreviewType,
} from "../utils/document-preview";

interface DocumentPreviewProps {
  readonly document: Pick<DocumentDetail, "fileUrl" | "format" | "title">;
}

function PreviewMessage({ message }: { readonly message: string }) {
  return (
    <View className="h-72 items-center justify-center gap-3 bg-surface-container-low px-6">
      <MaterialIcons name="preview" size={42} color="#737686" />
      <Text className="text-center text-sm leading-6 text-on-surface-variant">
        {message}
      </Text>
    </View>
  );
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const previewType = getDocumentPreviewType(document.format);
  const textPreview = useDocumentText(document.fileUrl, previewType === "text");

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
      if (textPreview.isLoading) {
        return (
          <View className="h-72 items-center justify-center">
            <ActivityIndicator />
          </View>
        );
      }
      if (textPreview.error)
        return <PreviewMessage message={textPreview.error} />;

      return (
        <View className="max-h-[480px] bg-white p-4">
          <Text selectable className="font-mono text-sm leading-6 text-black">
            {textPreview.text || "Tệp văn bản không có nội dung."}
          </Text>
        </View>
      );
    }

    if (previewType === "pdf" || previewType === "office") {
      return (
        <iframe
          src={buildEmbeddedPreviewUrl(document.fileUrl, previewType)}
          title={`Xem trước ${document.title}`}
          style={{ border: 0, height: 500, width: "100%" }}
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
