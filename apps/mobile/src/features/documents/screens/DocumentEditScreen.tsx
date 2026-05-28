import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Button, Card, PageShell } from "@/components";
import { DocumentCategorySelector } from "../components/DocumentCategorySelector";
import { DocumentTextField } from "../components/DocumentTextField";
import { DocumentUploadField } from "../components/DocumentUploadField";
import type {
  DocumentCategoryOption,
  DocumentCategoryValue,
  DocumentUploadFormValues,
} from "../types/document.types";

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

const sampleExisting = {
  fileName: "Baocao_NghienCuu_AI_v2.pdf",
  title: "Báo cáo Nghiên cứu Trí tuệ Nhân tạo Toàn diện 2024",
  category: "cs" as DocumentCategoryValue,
  description:
    "Tài liệu tổng hợp các xu hướng mới nhất về Học máy và ứng dụng của AI trong công nghiệp.",
};

export function DocumentEditScreen() {
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
    // populate with existing data (would come from API in real app)
    setValue("fileName", sampleExisting.fileName, { shouldValidate: false });
    setValue("title", sampleExisting.title, { shouldValidate: false });
    setValue("category", sampleExisting.category, { shouldValidate: false });
    setValue("description", sampleExisting.description, {
      shouldValidate: false,
    });
  }, [setValue]);

  const fileName = watch("fileName");

  const handleClearFile = () =>
    setValue("fileName", "", { shouldValidate: true });

  const onUpdate = () => {
    // save and navigate back to detail
    router.push("/(templates)/document-detail" as never);
  };

  const onDelete = () => {
    // destructive action -- navigate back to library or previous
    router.back();
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
                    onPickSample={() =>
                      setValue("fileName", sampleExisting.fileName, {
                        shouldValidate: true,
                      })
                    }
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
            <Button variant="outline" onPress={onDelete}>
              Xóa tài liệu này
            </Button>
          </View>
        </ScrollView>
      </View>
    </PageShell>
  );
}

export default DocumentEditScreen;
