import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components";
import { getAccessToken } from "@/utils/storage";
import { resendVerificationEmailService } from "../services/auth.service";
import { getAuthTokenStatus } from "../utils/auth-token";

const UNVERIFIED_MESSAGE =
  "Tài khoản của bạn chưa xác thực email. Vui lòng kiểm tra hộp thư để xác thực.";

export function EmailVerificationBanner() {
  const [isUnverified, setIsUnverified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      const token = await getAccessToken();
      const status = getAuthTokenStatus(token);

      if (isMounted) {
        setIsUnverified(status === "UNVERIFIED");
      }
    };

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleResend = async () => {
    if (isResending) {
      return;
    }

    setIsResending(true);
    setMessage("");

    try {
      const response = await resendVerificationEmailService();
      setMessage(response.message || "Email xác thực đã được gửi.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể gửi lại email xác thực.",
      );
    } finally {
      setIsResending(false);
    }
  };

  if (!isUnverified) {
    return null;
  }

  return (
    <View className="gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <View className="flex-row items-start gap-3">
        <Ionicons name="mail-unread-outline" size={22} color="#b45309" />
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold text-amber-950">
            {UNVERIFIED_MESSAGE}
          </Text>
          {message ? (
            <Text className="mt-1 text-sm font-medium text-amber-800">
              {message}
            </Text>
          ) : null}
        </View>
      </View>
      <Button
        variant="outline"
        fullWidth
        loading={isResending}
        onPress={handleResend}
      >
        Gửi lại email xác thực
      </Button>
    </View>
  );
}
