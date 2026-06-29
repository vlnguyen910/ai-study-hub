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
import { router } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { Controller } from "react-hook-form";
import { Button, Card, PageShell } from "@/components";
import { useSignUp } from "../hooks/useSignUp";

export function AuthRegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { form, isLoading, submit } = useSignUp();

  const handleRegister = () => {
    submit(() => {
      router.replace(ROUTES.LOGIN as never);
    });
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
          {/* Logo Brand Header */}
          <View className="mb-6 items-center gap-2">
            <View className="flex-row items-center gap-2">
              <Icon name="book" size={32} color="#004ac6" />
              <Text className="text-3xl font-extrabold text-primary tracking-wide">
                AcadeMiShare
              </Text>
            </View>
            <Text className="text-2xl font-extrabold text-on-background mt-2">
              Sign Up
            </Text>
            <Text className="text-sm font-medium text-outline text-center px-4 leading-5 mt-1">
              Join the largest academic community to share knowledge.
            </Text>
          </View>

          {/* Register Card Form */}
          <Card className="shadow-sm p-6 bg-white border border-outline-variant rounded-2xl">
            <View className="gap-4">
              {/* Full Name Input */}
              <View>
                <Text className="text-xs font-bold text-on-background mb-1.5">
                  Họ và tên
                </Text>
                <Controller
                  control={form.control}
                  name="name"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <View
                        className={`flex-row items-center border ${error ? "border-red-500" : "border-outline-variant"} bg-white px-3 py-2.5 rounded-xl`}
                      >
                        <Icon
                          name="person"
                          size={20}
                          color="#737686"
                          style={{ marginRight: 8 }}
                        />
                        <TextInput
                          className="flex-1 text-base text-on-background p-0"
                          placeholder="Nguyễn Văn A"
                          placeholderTextColor="#737686"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          autoCapitalize="words"
                          autoCorrect={false}
                        />
                      </View>
                      {error && (
                        <Text className="text-red-500 text-xs mt-1">
                          {error.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              {/* Email Input */}
              <View>
                <Text className="text-xs font-bold text-on-background mb-1.5">
                  Email
                </Text>
                <Controller
                  control={form.control}
                  name="email"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <View
                        className={`flex-row items-center border ${error ? "border-red-500" : "border-outline-variant"} bg-white px-3 py-2.5 rounded-xl`}
                      >
                        <Icon
                          name="envelope"
                          size={20}
                          color="#737686"
                          style={{ marginRight: 8 }}
                        />
                        <TextInput
                          className="flex-1 text-base text-on-background p-0"
                          placeholder="example@email.com"
                          placeholderTextColor="#737686"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      </View>
                      {error && (
                        <Text className="text-red-500 text-xs mt-1">
                          {error.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              {/* Password Input */}
              <View>
                <Text className="text-xs font-bold text-on-background mb-1.5">
                  Mật khẩu
                </Text>
                <Controller
                  control={form.control}
                  name="password"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <View
                        className={`flex-row items-center border ${error ? "border-red-500" : "border-outline-variant"} bg-white px-3 py-2.5 rounded-xl`}
                      >
                        <Icon
                          name="lock"
                          size={20}
                          color="#737686"
                          style={{ marginRight: 8 }}
                        />
                        <TextInput
                          className="flex-1 text-base text-on-background p-0"
                          placeholder="••••••••"
                          placeholderTextColor="#737686"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                        <Pressable
                          onPress={() => setShowPassword(!showPassword)}
                          className="ml-2 p-1"
                          accessibilityRole="button"
                          accessibilityLabel={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          <Icon
                            name={showPassword ? "eye" : "eye.slash"}
                            size={20}
                            color="#737686"
                          />
                        </Pressable>
                      </View>
                      {error && (
                        <Text className="text-red-500 text-xs mt-1">
                          {error.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              {/* Confirm Password Input */}
              <View>
                <Text className="text-xs font-bold text-on-background mb-1.5">
                  Xác nhận mật khẩu
                </Text>
                <Controller
                  control={form.control}
                  name="confirmPassword"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <View
                        className={`flex-row items-center border ${error ? "border-red-500" : "border-outline-variant"} bg-white px-3 py-2.5 rounded-xl`}
                      >
                        <Icon
                          name="lock"
                          size={20}
                          color="#737686"
                          style={{ marginRight: 8 }}
                        />
                        <TextInput
                          className="flex-1 text-base text-on-background p-0"
                          placeholder="••••••••"
                          placeholderTextColor="#737686"
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                        <Pressable
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="ml-2 p-1"
                          accessibilityRole="button"
                          accessibilityLabel={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          <Icon
                            name={showConfirmPassword ? "eye" : "eye.slash"}
                            size={20}
                            color="#737686"
                          />
                        </Pressable>
                      </View>
                      {error && (
                        <Text className="text-red-500 text-xs mt-1">
                          {error.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              {/* Register Button */}
              <View className="mt-4">
                <Button
                  variant="primary"
                  fullWidth
                  loading={isLoading}
                  onPress={handleRegister}
                  rightIcon={
                    <Icon name="arrow.right" size={18} color="#ffffff" />
                  }
                >
                  Register
                </Button>
              </View>

              {/* Divider */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-[1px] bg-outline-variant opacity-60" />
                <Text className="mx-3 text-xs font-semibold text-outline">
                  Or register with
                </Text>
                <View className="flex-1 h-[1px] bg-outline-variant opacity-60" />
              </View>

              {/* Social Buttons */}
              <Button
                variant="outline"
                fullWidth
                leftIcon={
                  <Icon
                    name="questionmark"
                    materialCommunityIcon={{ name: "google" }}
                    size={18}
                    color="#EA4335"
                  />
                }
                onPress={() => {}}
              >
                Google
              </Button>
            </View>
          </Card>

          {/* Footer Login Link */}
          <View className="flex-row justify-center items-center mt-8 mb-4">
            <Text className="text-xs font-medium text-outline">
              Already have an account?{" "}
            </Text>
            <Pressable
              onPress={() => router.replace(ROUTES.LOGIN as never)}
              accessibilityRole="button"
            >
              <Text className="text-xs font-bold text-primary">Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageShell>
  );
}
