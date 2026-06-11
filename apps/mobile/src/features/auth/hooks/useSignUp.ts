import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signUpSchema,
  type SignUpFormValues,
} from "../validators/auth.validator";
import { signUpService, AuthServiceError } from "../services/auth.service";
import type { SignUpPayload } from "../types/auth.types";
import { Alert } from "react-native";

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    mode: "onChange",
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (
    values: SignUpFormValues,
    onSuccess?: (email: string) => void,
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: SignUpPayload = {
        name: values.name,
        email: values.email,
        password: values.password,
      };

      const response = await signUpService(payload);

      if (response.success || response.status_code === 201) {
        Alert.alert(
          "Thành công",
          "Vui lòng kiểm tra email và bấm liên kết xác thực mới nhất.",
        );
        if (onSuccess) {
          onSuccess(values.email);
        }
      } else {
        setErrorMessage(response.message || "Đăng ký thất bại");
        Alert.alert("Lỗi", response.message || "Đăng ký thất bại");
      }
    } catch (error) {
      const msg =
        error instanceof AuthServiceError
          ? error.message
          : "Đã xảy ra lỗi không mong muốn";
      setErrorMessage(msg);
      Alert.alert("Đăng ký thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    errorMessage,
    submit: (onSuccess?: (email: string) => void) =>
      form.handleSubmit((values) => onSubmit(values, onSuccess))(),
  };
};
