import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@/components/nativewindui/Icon";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { Button, Card, PageShell } from "@/components";
import { ROUTES } from "@/constants/routes";
import { DocumentCategorySelector } from "../components/DocumentCategorySelector";
import { DocumentTextField } from "../components/DocumentTextField";
import { DocumentUploadField } from "../components/DocumentUploadField";
import {
  createDocument,
  fetchSubjects,
  generateDescriptionFromUrl,
} from "../services/documents.service";
import * as DocumentPicker from "expo-document-picker";
import {
  uploadToCloudinary,
  type CloudinaryUploadResponse,
} from "../../../services/cloudinary.service";
import type { DocumentCategoryOption, Subject } from "../types/document.types";

interface DocumentUploadScreenProps {
  readonly cancelHref?: string;
  readonly showBackButton?: boolean;
}

const documentUploadSchema = z.object({
  fileName: z.string().trim().min(1, "Vui lòng chọn một tệp để tải lên"),
  title: z.string().trim().min(1, "Tiêu đề tài liệu không được để trống"),
  subjectId: z.string().trim().min(1, "Vui lòng chọn môn học"),
  description: z.string().trim().optional().default(""),
  isPublic: z.boolean().default(true),
});

type DocumentUploadFormInput = z.input<typeof documentUploadSchema>;
type DocumentUploadFormOutput = z.output<typeof documentUploadSchema>;

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

export function DocumentUploadScreen({
  cancelHref,
  showBackButton = true,
}: DocumentUploadScreenProps = {}) {
  const [pickedFile, setPickedFile] = useState<{
    uri: string;
    name: string;
    size: number;
  } | null>(null);
  const [uploadedFile, setUploadedFile] =
    useState<CloudinaryUploadResponse | null>(null);
  const [subjects, setSubjects] = useState<readonly Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

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
      subjectId: "",
      description: "",
      isPublic: true,
    },
  });

  const fileName = watch("fileName");
  const subjectId = watch("subjectId");

  const subjectOptions = useMemo<readonly DocumentCategoryOption[]>(
    () =>
      subjects.map((subject) => ({
        label: subject.name,
        value: subject.id,
      })),
    [subjects],
  );

  useEffect(() => {
    let mounted = true;

    fetchSubjects(100)
      .then((response) => {
        if (!mounted) return;
        setSubjects(response.subjects);
        const firstSubject = response.subjects[0];
        if (firstSubject) {
          setValue("subjectId", firstSubject.id, { shouldValidate: false });
        }
      })
      .catch(() => {
        if (mounted) {
          setSubjects([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingSubjects(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [setValue]);

  const ensureUploadedFile = useCallback(async () => {
    if (!pickedFile) {
      throw new Error("Vui lòng chọn một tệp hợp lệ để tải lên.");
    }

    if (uploadedFile) {
      return uploadedFile;
    }

    const fileExtension =
      pickedFile.name.split(".").pop()?.toLowerCase() || "pdf";
    const cloudinaryRes = await uploadToCloudinary(
      pickedFile.uri,
      pickedFile.name,
      fileExtension,
    );
    setUploadedFile(cloudinaryRes);
    return cloudinaryRes;
  }, [pickedFile, uploadedFile]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
          "text/plain",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "application/vnd.ms-powerpoint",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const maxSizeBytes = 10485760; // 10MB (10,485,760 bytes) Cloudinary free raw limit

      if (asset.size && asset.size > maxSizeBytes) {
        Alert.alert(
          "Lỗi",
          "Kích thước tệp vượt quá giới hạn 10MB (Mức tối đa cho phép của dịch vụ lưu trữ là 10MB).",
        );
        return;
      }

      setPickedFile({
        uri: asset.uri,
        name: asset.name,
        size: asset.size || 0,
      });
      setUploadedFile(null);
      setValue("fileName", asset.name, { shouldValidate: true });
    } catch {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi chọn tệp.");
    }
  };

  const handleClearFile = () => {
    setPickedFile(null);
    setUploadedFile(null);
    setValue("fileName", "", { shouldValidate: true });
  };

  const handleCancel = () => {
    if (cancelHref) {
      router.push(cancelHref as never);
      return;
    }

    router.back();
  };

  const handleGenerateDescription = async () => {
    if (!pickedFile || isAiLoading) {
      return;
    }

    setIsAiLoading(true);
    try {
      const cloudinaryRes = await ensureUploadedFile();
      const description = await generateDescriptionFromUrl(
        cloudinaryRes.secureUrl,
        cloudinaryRes.format,
      );
      setValue("description", description, { shouldValidate: true });
    } catch (error) {
      Alert.alert(
        "Không thể tạo mô tả",
        error instanceof Error
          ? error.message
          : "AI chưa thể phân tích tài liệu này. Vui lòng thử lại.",
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const onSubmit = async (values: DocumentUploadFormOutput) => {
    if (!pickedFile) {
      Alert.alert("Lỗi", "Vui lòng chọn một tệp hợp lệ để tải lên.");
      return;
    }

    try {
      const fileExtension =
        pickedFile.name.split(".").pop()?.toLowerCase() || "pdf";

      // Step 1: Upload to Cloudinary if the AI action has not uploaded it yet
      const cloudinaryRes = await ensureUploadedFile();

      // Step 2: Create document on backend
      const payload = {
        title: values.title,
        description: values.description?.trim() || undefined,
        fileUrl: cloudinaryRes.secureUrl,
        publicId: cloudinaryRes.publicId,
        sizeInBytes: cloudinaryRes.bytes || pickedFile.size || 0,
        format: cloudinaryRes.format || fileExtension,
        resourceType: cloudinaryRes.resourceType,
        subjectId: values.subjectId,
        isPublic: values.isPublic,
      };

      const document = await createDocument(payload);

      if (document.id) {
        router.push(ROUTES.DOCUMENT_DETAIL(document.id) as never);
      }
    } catch {
      Alert.alert(
        "Lỗi",
        "Tải lên thất bại. Vui lòng kiểm tra lại cấu hình mạng hoặc tài khoản Cloudinary.",
      );
    }
  };

  return (
    <PageShell contentClassName="p-0">
      <View className="flex-1 bg-background">
        <View className="border-b border-outline-variant/70 bg-surface-container-lowest px-4 py-4">
          <View className="flex-row items-center gap-3">
            {showBackButton ? (
              <Pressable
                accessibilityRole="button"
                className="rounded-full bg-surface-container-high p-3"
                onPress={() => router.back()}
              >
                <Icon name="chevron.left" size={20} color="#191b23" />
              </Pressable>
            ) : null}
            <View className="min-w-0 flex-1">
              <Text className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Upload
              </Text>
              <Text className="text-2xl font-bold tracking-tight text-on-surface">
                Tải lên tài liệu
              </Text>
            </View>
            <View className="rounded-3xl bg-primary/10 p-3">
              <Icon
                materialIcon={{ name: "upload-file" }}
                size={24}
                color="#004ac6"
              />
            </View>
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
          <View className="overflow-hidden rounded-[32px] bg-primary p-5 shadow-lg shadow-primary/20">
            <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
            <Text className="text-2xl font-bold tracking-tight text-on-primary">
              Chia sẻ kiến thức với cộng đồng
            </Text>
            <Text className="mt-2 text-sm leading-6 text-on-primary/85">
              Chọn tài liệu, gắn môn học và để AI hỗ trợ tạo mô tả ban đầu.
            </Text>
          </View>

          <Card className="mt-6">
            <View className="gap-5">
              <Controller
                control={control}
                name="fileName"
                render={({ field }) => (
                  <DocumentUploadField
                    fileName={pickedFile?.name ?? field.value ?? null}
                    onPick={handlePickDocument}
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
                name="subjectId"
                render={({ field }) => (
                  <DocumentCategorySelector
                    value={field.value}
                    options={subjectOptions}
                    onChange={field.onChange}
                    errorMessage={errors.subjectId?.message}
                    isLoading={isLoadingSubjects}
                  />
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <DocumentTextField
                    label="Mô tả (Không bắt buộc)"
                    placeholder="Nhập mô tả hoặc chạm 'Tạo bằng AI' để tự động tóm tắt tài liệu..."
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    multiline
                    errorMessage={errors.description?.message}
                    onPressAi={
                      fileName
                        ? () => void handleGenerateDescription()
                        : undefined
                    }
                    isAiLoading={isAiLoading}
                  />
                )}
              />
              <Controller
                control={control}
                name="isPublic"
                render={({ field }) => (
                  <View className="flex-row items-center justify-between py-2 border-t border-b border-outline-variant/30">
                    <View className="flex-1 pr-4">
                      <Text className="text-sm font-semibold text-on-surface">
                        Chia sẻ với cộng đồng (Công khai)
                      </Text>
                      <Text className="text-xs text-on-surface-variant mt-1 leading-5">
                        Tài liệu công khai cần được duyệt trước khi xuất hiện
                        trên bảng tin. Tài liệu riêng tư sẽ hoạt động ngay lập
                        tức.
                      </Text>
                    </View>
                    <Switch
                      value={field.value}
                      onValueChange={field.onChange}
                      trackColor={{ false: "#d1d5db", true: "#004ac6" }}
                      thumbColor={field.value ? "#ffffff" : "#f3f4f6"}
                    />
                  </View>
                )}
              />
              <View className="flex-row gap-4 pt-1">
                <View className="flex-1">
                  <Button variant="outline" fullWidth onPress={handleCancel}>
                    Hủy
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    fullWidth
                    loading={isSubmitting}
                    disabled={isAiLoading || isLoadingSubjects}
                    onPress={handleSubmit(onSubmit)}
                  >
                    Tải lên
                  </Button>
                </View>
              </View>
            </View>
          </Card>

          <Card
            className="mt-6"
            title="Tài liệu liên quan"
            subtitle="Một vài tài liệu mẫu để bạn tham khảo cách đặt tiêu đề."
          >
            <View className="gap-3">
              {relatedDocuments.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push(ROUTES.DOCUMENT_DETAIL(item.id) as never)
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
                          <Icon
                            name="square.and.arrow.down"
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
            Môn học hiện tại:{" "}
            {subjects.find((subject) => subject.id === subjectId)?.name ||
              "chưa chọn"}
            . Tệp đã chọn: {fileName || "chưa chọn"}.
          </Text>
        </ScrollView>
      </View>
    </PageShell>
  );
}
