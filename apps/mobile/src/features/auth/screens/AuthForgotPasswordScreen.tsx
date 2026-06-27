import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Icon } from "@/components/nativewindui/Icon";
import { Button, Card, PageShell } from "@/components";
import { forgotPasswordService } from "../services/auth.service";

export function AuthForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Vui lòng nhập email.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setError("Email không hợp lệ.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await forgotPasswordService({ email: normalizedEmail });
      setSubmittedEmail(normalizedEmail);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể gửi liên kết đặt lại mật khẩu.",
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
            paddingHorizontal: 16,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
          className="bg-surface"
        >
          {/* Reset Lock Illustration */}
          <View className="w-28 h-28 bg-[#eef3ff] rounded-3xl justify-center items-center self-center mb-8 relative border border-primary-fixed-dim/30">
            <Icon name="lock" size={56} color="#004ac6" />
            <View className="absolute justify-center items-center">
              <Icon name="key" size={22} color="#004ac6" />
            </View>
          </View>

          {/* Title & Description */}
          <View className="items-center mb-8 px-4">
            <Text className="text-2xl font-extrabold text-on-background mb-3 text-center">
              Quên mật khẩu
            </Text>
            <Text className="text-sm font-medium text-outline text-center leading-5 px-2">
              Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi một liên
              kết để bạn đặt lại mật khẩu mới.
            </Text>
          </View>

          {/* Form Card */}
          <Card className="shadow-sm p-6 bg-white border border-outline-variant rounded-2xl">
            <View className="gap-6">
              {/* Email Input */}
              <View>
                <Text className="text-xs font-bold text-on-background mb-1.5">
                  Địa chỉ Email
                </Text>
                <View className="flex-row items-center border border-outline-variant bg-white px-3 py-2.5 rounded-xl">
                  <Icon
                    name="envelope"
                    size={20}
                    color="#737686"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    className="flex-1 text-base text-on-background p-0"
                    placeholder="vidu@academic.edu.vn"
                    placeholderTextColor="#737686"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (error) {
                        setError("");
                      }
                    }}
                  />
                </View>
                {error ? (
                  <Text className="text-xs font-medium text-error mt-2">
                    {error}
                  </Text>
                ) : null}
              </View>

              {submittedEmail ? (
                <View className="rounded-xl border border-primary-fixed-dim bg-[#eef3ff] p-4">
                  <Text className="text-sm font-semibold text-on-background">
                    Kiểm tra hộp thư của bạn
                  </Text>
                  <Text className="text-xs font-medium text-outline mt-1 leading-5">
                    Nếu tài khoản tồn tại, liên kết đặt lại mật khẩu đã được gửi
                    đến {submittedEmail}.
                  </Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <Button
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                onPress={handleSendCode}
                rightIcon={<Icon name="paperplane" size={16} color="#ffffff" />}
              >
                Gửi liên kết đặt lại
              </Button>

              {/* Contact Support Link */}
              <View className="flex-row justify-center items-center mt-2 flex-wrap">
                <Text className="text-xs font-medium text-outline">
                  Bạn vẫn gặp khó khăn?{" "}
                </Text>
                <Pressable accessibilityRole="button">
                  <Text className="text-xs font-bold text-primary">
                    Liên hệ bộ phận hỗ trợ
                  </Text>
                </Pressable>
              </View>
            </View>
          </Card>

          {/* Graduation Cap Divider decoration */}
          <View className="flex-row items-center justify-center mt-12 gap-3">
            <View className="h-[1px] w-12 bg-outline-variant opacity-40" />
            <Icon name="book" size={18} color="#c3c6d7" />
            <View className="h-[1px] w-12 bg-outline-variant opacity-40" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageShell>
  );
}
