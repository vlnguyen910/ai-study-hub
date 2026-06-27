import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Icon } from "@/components/nativewindui/Icon";
import { router, useLocalSearchParams } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { Button, Card, PageShell } from "@/components";
import {
  AuthServiceError,
  resetPasswordService,
} from "../services/auth.service";

const getSingleParam = (value: string | string[] | undefined) => {
  return Array.isArray(value) ? value[0] : value;
};

export function AuthResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = getSingleParam(params.token)?.trim();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    if (!token) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordService({ token, password });
      setPassword("");
      setConfirmPassword("");
      setSuccessMessage("Mật khẩu đã được đặt lại.");
    } catch (error) {
      setError(
        error instanceof AuthServiceError
          ? error.message
          : "Không thể đặt lại mật khẩu.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell contentClassName="p-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 16,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
          className="bg-surface"
        >
          <Card className="shadow-sm p-6 bg-white border border-outline-variant rounded-2xl">
            <View className="items-center gap-2 mb-6">
              <Icon name="key" size={32} color="#004ac6" />
              <Text className="text-2xl font-extrabold text-on-background">
                Đặt lại mật khẩu
              </Text>
              <Text className="text-sm font-medium text-outline text-center leading-5">
                Nhập mật khẩu mới cho tài khoản của bạn.
              </Text>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-xs font-bold text-on-background mb-1.5">
                  Mật khẩu mới
                </Text>
                <TextInput
                  className="border border-outline-variant bg-white px-3 py-2.5 rounded-xl text-base text-on-background"
                  placeholder="Mật khẩu mới"
                  placeholderTextColor="#737686"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (error) setError("");
                  }}
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-on-background mb-1.5">
                  Xác nhận mật khẩu
                </Text>
                <TextInput
                  className="border border-outline-variant bg-white px-3 py-2.5 rounded-xl text-base text-on-background"
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor="#737686"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (error) setError("");
                  }}
                />
              </View>

              {error ? (
                <Text className="text-xs font-medium text-error">{error}</Text>
              ) : null}

              {successMessage ? (
                <View className="rounded-xl border border-primary-fixed-dim bg-[#eef3ff] p-4">
                  <Text className="text-sm font-semibold text-on-background">
                    {successMessage}
                  </Text>
                </View>
              ) : null}

              <Button
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                onPress={handleSubmit}
              >
                Đặt lại mật khẩu
              </Button>

              <Button
                variant="ghost"
                fullWidth
                onPress={() => router.replace(ROUTES.LOGIN as never)}
              >
                Quay lại đăng nhập
              </Button>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageShell>
  );
}
