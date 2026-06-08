import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button, Card, PageShell } from "@/components";
import { DocumentCategorySelector } from "../components/DocumentCategorySelector";
import { DocumentTextField } from "../components/DocumentTextField";
import { DocumentUploadField } from "../components/DocumentUploadField";
import type {
  DocumentCategoryOption,
  DocumentCategoryValue,
} from "../types/document.types";
import {
  deleteDocument,
  fetchDocumentDetail,
  updateDocument,
} from "../services/documents.service";

const categoryOptions: readonly DocumentCategoryOption[] = [
  { label: "Khoa học máy tính", value: "cs" },
  { label: "Toán học ứng dụng", value: "math" },
  { label: "Vật lý đại cương", value: "phys" },
  { label: "Kinh tế học", value: "eco" },
];

const documentEditSchema = z.object({
  fileName: z.string().trim().min(1, "Vui lòng chọn một tệp"),
  title: z.string().trim().min(1, "Tiêu đề không được để trống"),
  category: z.enum(["cs", "math", "phys", "eco"]),
  description: z.string().trim().optional().default(""),
});

type DocumentEditInput = z.input<typeof documentEditSchema>;
type DocumentEditOutput = z.output<typeof documentEditSchema>;

export function DocumentEditScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const documentId = useMemo(() => {
    const value = params.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params.id]);
  const [isLoading, setIsLoading] = useState(Boolean(documentId));
  const [error, setError] = useState<string | null>(
    documentId ? null : "Thiếu mã tài liệu để chỉnh sửa.",
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<DocumentEditInput, undefined, DocumentEditOutput>({
    resolver: zodResolver(documentEditSchema),
    defaultValues: {
      fileName: "",
      title: "",
      category: "cs",
      description: "",
    },
  });

  useEffect(() => {
    if (!documentId) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

    fetchDocumentDetail(documentId)
      .then((document) => {
        if (!mounted) return;
        setValue("fileName", document.publicId || document.title, {
          shouldValidate: false,
        });
        setValue("title", document.title, { shouldValidate: false });
        setValue("category", "cs", { shouldValidate: false });
        setValue("description", document.description ?? "", {
          shouldValidate: false,
        });
      })
      .catch(() => {
        if (mounted) setError("Không thể tải tài liệu để chỉnh sửa.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [documentId, setValue]);

  const fileName = watch("fileName");

  const handleClearFile = () =>
    setValue("fileName", "", { shouldValidate: true });

  const onUpdate = async (values: DocumentEditOutput) => {
    if (!documentId) return;

    await updateDocument(documentId, {
      title: values.title,
      description: values.description?.trim() || undefined,
    });

    router.push(`/(templates)/document-detail?id=${documentId}` as never);
  };

  const onDelete = () => {
    if (!documentId) return;

    Alert.alert("Xóa tài liệu", "Bạn có chắc chắn muốn xóa tài liệu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setIsDeleting(true);
          deleteDocument(documentId)
            .then(() => router.replace("/library" as never))
            .catch(() => setError("Xóa tài liệu thất bại. Vui lòng thử lại."))
            .finally(() => setIsDeleting(false));
        },
      },
    ]);
  };

  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-outline-variant bg-surface px-4 py-4">
          <Text className="text-2xl font-bold tracking-tight text-primary">
            Chỉnh sửa tài liệu
          </Text>
          <View className="flex-row items-center gap-4">
            <Pressable
              accessibilityRole="button"
              className="rounded-full p-2"
              onPress={() => {}}
            >
              <MaterialIcons name="dark-mode" size={22} color="#434655" />
            </Pressable>
            <View className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant bg-surface-container-highest" />
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center gap-3 px-6">
            <ActivityIndicator />
            <Text className="text-sm text-on-surface-variant">
              Đang tải tài liệu...
            </Text>
          </View>
        ) : error && !documentId ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-sm leading-6 text-error">
              {error}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 32,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-2">
              <Text className="text-3xl font-bold tracking-tight text-on-surface">
                Chỉnh sửa tài liệu
              </Text>
              <Text className="text-base leading-6 text-on-surface-variant">
                Cập nhật thông tin tài liệu
              </Text>
            </View>

            <Card className="mt-6 rounded-2xl p-5">
              <View className="gap-5">
                <Controller
                  control={control}
                  name="fileName"
                  render={({ field }) => (
                    <DocumentUploadField
                      fileName={field.value ?? null}
                      onPickSample={() => {}}
                      onClear={handleClearFile}
                      errorMessage={errors.fileName?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <DocumentTextField
                      label="Tiêu đề tài liệu"
                      placeholder="Nhập tiêu đề..."
                      value={field.value}
                      onChangeText={field.onChange}
                      errorMessage={errors.title?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <DocumentCategorySelector
                      value={field.value}
                      options={categoryOptions}
                      onChange={(value: DocumentCategoryValue) =>
                        field.onChange(value)
                      }
                      errorMessage={errors.category?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <DocumentTextField
                      label="Mô tả (Không bắt buộc)"
                      placeholder="Tóm tắt ngắn gọn nội dung..."
                      value={field.value ?? ""}
                      onChangeText={field.onChange}
                      multiline
                      errorMessage={errors.description?.message}
                    />
                  )}
                />

                <View className="flex-row gap-4 pt-1">
                  <View className="flex-1">
                    <Button
                      variant="outline"
                      fullWidth
                      onPress={() => router.back()}
                    >
                      Hủy
                    </Button>
                  </View>
                  <View className="flex-1">
                    <Button
                      fullWidth
                      loading={isSubmitting}
                      onPress={handleSubmit(onUpdate)}
                    >
                      Cập nhật
                    </Button>
                  </View>
                </View>
              </View>
            </Card>

            <View className="flex-1" />

            <View className="flex-col gap-4 mt-8 pb-8">
              {error ? (
                <Text className="text-sm leading-6 text-error">{error}</Text>
              ) : null}
              <Button variant="outline" loading={isDeleting} onPress={onDelete}>
                {isDeleting ? "Đang xóa..." : "Xóa tài liệu này"}
              </Button>
            </View>
          </ScrollView>
        )}
      </View>
    </PageShell>
  );
}

export default DocumentEditScreen;
