import { useState } from "react";
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
import { createDocument } from "../services/documents.service";
import type {
  DocumentCategoryOption,
  DocumentCategoryValue,
} from "../types/document.types";

const categoryOptions: readonly DocumentCategoryOption[] = [
  { label: "Khoa học máy tính", value: "cs" },
  { label: "Toán học ứng dụng", value: "math" },
  { label: "Vật lý đại cương", value: "phys" },
  { label: "Kinh tế học", value: "eco" },
];

const documentUploadSchema = z.object({
  fileName: z.string().trim().min(1, "Vui lòng chọn một tệp để tải lên"),
  title: z.string().trim().min(1, "Tiêu đề tài liệu không được để trống"),
  category: z.enum(["cs", "math", "phys", "eco"]),
  description: z.string().trim().optional().default(""),
});

type DocumentUploadFormInput = z.input<typeof documentUploadSchema>;
type DocumentUploadFormOutput = z.output<typeof documentUploadSchema>;

const sampleFileName = "data-structures-guide.pdf";
const sampleFileUrl = "https://example.com/uploads/data-structures-guide.pdf";

const relatedDocuments = [
  {
    id: "related-1",
    title: "Lập trình Hướng đối tượng với Java",
    author: "Trần Thị B",
    downloads: "520",
    previewUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOe9x2JFugjqOcspI5qZdr8jrDEnBEMnPV1Qx7kL8cjQ9Fdg4Fr3O3wSzRhP81pmJV5GHrEAiTQmpg2_kh-XuDmGqR_mL_DlLL9-IOCD-ktZboZK6uBDGMlq0TE7ZU7PFknrRxWssYoY2Q8PkGS9olqkxmRTmCy2iYjAuhUW08eAaGrv6a8LaVPv_6ojyjtfNzcf2wi5PpFI0gHEU9motCyK8d8fY_rMHJBKBJgpZ9UUVFn9VUTILc3bLNHNU_RvDcX2k76UJpK7A",
  },
  {
    id: "related-2",
    title: "Nhập môn Cơ sở dữ liệu Quan hệ",
    author: "Lê Văn C",
    downloads: "1.2k",
    previewUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCzBy3OqSbLq3OQDKspyhvLRl7w76oxcHbI3EUnnpH7h6sjgC2GiqhxvOPY7a4E7E9IRn3OJ8BZoiW42FPengZld4Fw2fdgcxCJpCzm8mRDIw1o-1NrfF4RPJJlWgRBiTejzSWjR-fF1LRhdIN8a_ZhGYt3JKJy5XT4PxvibRiS6t19EWxEHeuFbnwF1zkyprIamlgGRdQpvoWtQI5d9Pq7UU9nk1W6Tzg9jLSL960cWt7rMsEdZRDavJqlR7AU_T5sdtFJrudDYWM",
  },
] as const;

export function DocumentUploadScreen() {
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<DocumentUploadFormInput, undefined, DocumentUploadFormOutput>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      fileName: "",
      title: "",
      category: "cs",
      description: "",
    },
  });

  const fileName = watch("fileName");
  const category = watch("category");

  const handlePickSampleFile = () => {
    setPickedFileName(sampleFileName);
    setValue("fileName", sampleFileName, { shouldValidate: true });
  };

  const handleClearFile = () => {
    setPickedFileName(null);
    setValue("fileName", "", { shouldValidate: true });
  };

  const onSubmit = async (values: DocumentUploadFormOutput) => {
    const document = await createDocument({
      title: values.title,
      description: values.description?.trim() || undefined,
      fileUrl: sampleFileUrl,
      publicId: `mobile-${Date.now()}`,
      sizeInBytes: 2 * 1024 * 1024,
      format: values.fileName.split(".").pop()?.toLowerCase() || "pdf",
      resourceType: "document",
      isPublic: true,
    });

    router.push(
      document?.id
        ? (`/(templates)/document-detail?id=${document.id}` as never)
        : ("/(templates)/document-detail" as never),
    );
  };

  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 bg-background">
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
              Tải lên tài liệu
            </Text>
            <Text className="text-base leading-6 text-on-surface-variant">
              Chia sẻ kiến thức với cộng đồng học thuật.
            </Text>
          </View>

          <Card className="mt-6 rounded-2xl p-5">
            <View className="gap-5">
              <Controller
                control={control}
                name="fileName"
                render={({ field }) => (
                  <DocumentUploadField
                    fileName={pickedFileName ?? field.value ?? null}
                    onPickSample={handlePickSampleFile}
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
                    onPress={handleSubmit(onSubmit)}
                  >
                    Tải lên
                  </Button>
                </View>
              </View>
            </View>
          </Card>

          <Card
            className="mt-6 rounded-2xl p-5"
            title="Tài liệu liên quan"
            subtitle="Chạm để mở màn chi tiết tài liệu mẫu."
          >
            <View className="gap-3">
              {relatedDocuments.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push("/(templates)/document-detail" as never)
                  }
                >
                  <View className="flex-row gap-3 rounded-2xl border border-outline-variant bg-surface p-3">
                    <View className="h-20 w-16 rounded-xl bg-surface-container-highest" />
                    <View className="flex-1 justify-between py-0.5">
                      <Text className="text-sm font-semibold leading-5 text-on-surface">
                        {item.title}
                      </Text>
                      <View className="mt-2 flex-row items-center justify-between gap-2">
                        <Text className="text-xs text-on-surface-variant">
                          {item.author}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons
                            name="download"
                            size={14}
                            color="#434655"
                          />
                          <Text className="text-xs text-on-surface-variant">
                            {item.downloads}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>

          <Text className="mt-4 text-xs text-on-surface-variant">
            Danh mục hiện tại: {category || "chưa chọn"}. Tệp đã chọn:{" "}
            {fileName || "chưa chọn"}.
          </Text>
        </ScrollView>
      </View>
    </PageShell>
  );
}
