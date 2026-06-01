import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInSchema,
  type SignInFormValues,
} from "../validators/auth.validator";
import { signInService, AuthServiceError } from "../services/auth.service";
import type { SignInPayload } from "../types/auth.types";
import { Alert } from "react-native";
import { saveTokens } from "../../../utils/storage";

export const useSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    mode: "onChange",
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues, onSuccess?: () => void) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: SignInPayload = {
        email: values.email,
        password: values.password,
        deviceInfo: "MOBILE",
      };

      const response = await signInService(payload);

      if (response.success || response.status_code === 200) {
        if (response.data) {
          await saveTokens(
            response.data.accessToken,
            response.data.refreshToken,
          );
        }

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrorMessage(response.message || "Đăng nhập thất bại");
        Alert.alert("Lỗi", response.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      const msg =
        error instanceof AuthServiceError
          ? error.message
          : "Đã xảy ra lỗi không mong muốn";
      setErrorMessage(msg);
      Alert.alert("Đăng nhập thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    errorMessage,
    submit: (onSuccess?: () => void) =>
      form.handleSubmit((values) => onSubmit(values, onSuccess))(),
  };
};
