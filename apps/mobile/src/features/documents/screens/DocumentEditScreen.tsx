import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@/components/nativewindui/Icon";
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
import { ROUTES } from "@/constants/routes";
import { DocumentCategorySelector } from "../components/DocumentCategorySelector";
import { DocumentTextField } from "../components/DocumentTextField";
import { DocumentUploadField } from "../components/DocumentUploadField";
import type { DocumentCategoryOption, Subject } from "../types/document.types";
import {
  deleteDocument,
  fetchDocumentDetail,
  fetchSubjects,
  updateDocument,
} from "../services/documents.service";

const documentEditSchema = z.object({
  fileName: z.string().trim().min(1, "Vui lòng chọn một tệp"),
  title: z.string().trim().min(1, "Tiêu đề không được để trống"),
  subjectId: z.string().trim().min(1, "Vui lòng chọn môn học"),
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
  const [subjects, setSubjects] = useState<readonly Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<DocumentEditInput, undefined, DocumentEditOutput>({
    resolver: zodResolver(documentEditSchema),
    defaultValues: {
      fileName: "",
      title: "",
      subjectId: "",
      description: "",
    },
  });

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
  }, []);

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
        setValue("subjectId", document.subject?.id ?? "", {
          shouldValidate: false,
        });
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

  const handleClearFile = () =>
    setValue("fileName", "", { shouldValidate: true });

  const onUpdate = async (values: DocumentEditOutput) => {
    if (!documentId) return;

    await updateDocument(documentId, {
      title: values.title,
      description: values.description?.trim() || undefined,
      subjectId: values.subjectId,
    });

    router.push(ROUTES.DOCUMENT_DETAIL(documentId) as never);
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
        <View className="border-b border-outline-variant/70 bg-surface-container-lowest px-4 py-4">
          <View className="flex-row items-center gap-3">
            <Pressable
              accessibilityRole="button"
              className="rounded-full bg-surface-container-high p-3"
              onPress={() => router.back()}
            >
              <Icon name="chevron.left" size={20} color="#191b23" />
            </Pressable>
            <View className="min-w-0 flex-1">
              <Text className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Editor
              </Text>
              <Text className="text-2xl font-bold tracking-tight text-on-surface">
                Chỉnh sửa tài liệu
              </Text>
            </View>
            <View className="rounded-3xl bg-primary/10 p-3">
              <Icon name="pencil" size={24} color="#004ac6" />
            </View>
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
            <View className="overflow-hidden rounded-[32px] bg-primary p-5 shadow-lg shadow-primary/20">
              <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
              <Text className="text-2xl font-bold tracking-tight text-on-primary">
                Cập nhật thông tin tài liệu
              </Text>
              <Text className="mt-2 text-sm leading-6 text-on-primary/85">
                Sửa tiêu đề, mô tả và môn học để tài liệu dễ được tìm thấy hơn.
              </Text>
            </View>

            <Card className="mt-6">
              <View className="gap-5">
                <Controller
                  control={control}
                  name="fileName"
                  render={({ field }) => (
                    <DocumentUploadField
                      fileName={field.value ?? null}
                      onPick={() => {}}
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
                      disabled={isLoadingSubjects}
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
