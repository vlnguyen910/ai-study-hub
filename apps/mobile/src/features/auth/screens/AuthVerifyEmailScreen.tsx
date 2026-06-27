import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Icon } from "@/components/nativewindui/Icon";
import { router, useLocalSearchParams } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { Button, Card, PageShell } from "@/components";
import {
  AuthServiceError,
  resendVerificationEmailService,
  verifyEmailService,
} from "../services/auth.service";
import { getDeviceId } from "@/utils/device";
import { saveTokens } from "@/utils/storage";

export function AuthVerifyEmailScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const verifyCurrentToken = useCallback(async (currentToken: string) => {
    const deviceId = await getDeviceId();
    const response = await verifyEmailService({
      token: currentToken,
      deviceId,
      deviceType: "MOBILE",
    });

    if (response.data?.accessToken && response.data.refreshToken) {
      await saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }, []);

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      setIsVerifying(true);

      try {
        await verifyCurrentToken(token);
        setVerificationMessage("Email đã được xác thực.");
        Alert.alert("Thành công", "Email đã được xác thực.", [
          {
            text: "Đăng nhập",
            onPress: () => router.replace(ROUTES.LOGIN as never),
          },
        ]);
      } catch (error) {
        const message =
          error instanceof AuthServiceError
            ? error.message
            : "Xác thực email thất bại";
        setVerificationMessage(message);
        Alert.alert("Lỗi", message);
      } finally {
        setIsVerifying(false);
      }
    };

    void verifyToken();
  }, [token, verifyCurrentToken]);

  const handleOpenLogin = () => {
    router.replace(ROUTES.LOGIN as never);
  };

  const handleVerify = async () => {
    if (!token) {
      Alert.alert(
        "Kiểm tra email",
        "Vui lòng bấm liên kết xác thực trong email mới nhất.",
      );
      return;
    }

    setIsVerifying(true);

    try {
      await verifyCurrentToken(token);
      Alert.alert("Thành công", "Email đã được xác thực.", [
        {
          text: "Đăng nhập",
          onPress: handleOpenLogin,
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
      await resendVerificationEmailService();
      Alert.alert("Đã gửi", "Email xác thực mới đã được gửi.");
    } catch (error) {
      const message =
        error instanceof AuthServiceError
          ? error.message
          : "Không thể gửi lại email xác thực";
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
              <Icon name="envelope" size={32} color="#004ac6" />
              <Text className="text-2xl font-extrabold text-on-background">
                Xác thực email
              </Text>
              <Text className="text-sm font-medium text-outline text-center leading-5">
                Bấm liên kết xác thực trong email mới nhất của bạn.
              </Text>
            </View>

            <View className="gap-4">
              {isVerifying ? (
                <View className="items-center gap-3 py-2">
                  <ActivityIndicator color="#004ac6" />
                  <Text className="text-sm font-medium text-outline">
                    Đang xác thực email...
                  </Text>
                </View>
              ) : null}

              {verificationMessage ? (
                <View className="border border-outline-variant bg-white px-3 py-2.5 rounded-xl">
                  <Text className="text-sm font-medium text-on-background text-center">
                    {verificationMessage}
                  </Text>
                </View>
              ) : null}

              <Button
                variant="primary"
                fullWidth
                loading={isVerifying}
                onPress={handleVerify}
              >
                Kiểm tra liên kết
              </Button>

              <Button
                variant="outline"
                fullWidth
                loading={isResending}
                onPress={handleResend}
              >
                Gửi lại email
              </Button>

              <Button variant="ghost" fullWidth onPress={handleOpenLogin}>
                Quay lại đăng nhập
              </Button>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageShell>
  );
}
