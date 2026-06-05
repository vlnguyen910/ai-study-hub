import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, PageShell } from "@/components";
import {
  AuthServiceError,
  resendVerificationCodeService,
  verifyEmailService,
} from "../services/auth.service";

export function AuthVerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);

    try {
      await verifyEmailService({ email, code });
      Alert.alert("Thành công", "Email đã được xác thực.", [
        {
          text: "Đăng nhập",
          onPress: () => router.replace("/(templates)/auth-login" as never),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof AuthServiceError
          ? error.message
          : "Xác thực email thất bại";
      Alert.alert("Lỗi", message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      await resendVerificationCodeService({ email });
      Alert.alert("Đã gửi", "Mã xác thực mới đã được gửi đến email.");
    } catch (error) {
      const message =
        error instanceof AuthServiceError
          ? error.message
          : "Không thể gửi lại mã xác thực";
      Alert.alert("Lỗi", message);
    } finally {
      setIsResending(false);
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
              <Ionicons name="mail-outline" size={32} color="#004ac6" />
              <Text className="text-2xl font-extrabold text-on-background">
                Xác thực email
              </Text>
              <Text className="text-sm font-medium text-outline text-center leading-5">
                Nhập mã xác thực đã được gửi đến email của bạn.
              </Text>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-xs font-bold text-on-background mb-1.5">
                  Email
                </Text>
                <View className="border border-outline-variant bg-white px-3 py-2.5 rounded-xl">
                  <TextInput
                    className="text-base text-on-background p-0"
                    placeholder="example@email.com"
                    placeholderTextColor="#737686"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View>
                <Text className="text-xs font-bold text-on-background mb-1.5">
                  Mã xác thực
                </Text>
                <View className="border border-outline-variant bg-white px-3 py-2.5 rounded-xl">
                  <TextInput
                    className="text-base text-on-background p-0"
                    placeholder="123456"
                    placeholderTextColor="#737686"
                    keyboardType="number-pad"
                    value={code}
                    onChangeText={setCode}
                  />
                </View>
              </View>

              <Button
                variant="primary"
                fullWidth
                loading={isVerifying}
                onPress={handleVerify}
              >
                Xác thực email
              </Button>

              <Button
                variant="outline"
                fullWidth
                loading={isResending}
                onPress={handleResend}
              >
                Gửi lại mã
              </Button>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageShell>
  );
}
