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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Card, PageShell } from "@/components";

export function AuthLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    if (!email || !password) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(templates)/document-upload" as never);
    }, 1500);
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
          <Card className="shadow-sm p-6">
            {/* Header Logo & Title */}
            <View style={{ alignItems: "center", marginBottom: 28 }}>
              <Ionicons name="school-outline" size={32} color="#004ac6" />
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: "#004ac6",
                  letterSpacing: 0.5,
                }}
              >
                AcademiShare
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#737686",
                  marginTop: 4,
                }}
              >
                Hệ thống học liệu
              </Text>
            </View>

            {/* Form Inputs */}
            <View style={{ gap: 16 }}>
              {/* Email Input */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#191b23",
                    marginBottom: 6,
                  }}
                >
                  Email
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#c3c6d7",
                    backgroundColor: "#ffffff",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#191b23",
                      padding: 0,
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#737686"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#191b23",
                    marginBottom: 6,
                  }}
                >
                  Password
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#c3c6d7",
                    backgroundColor: "#ffffff",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#191b23",
                      padding: 0,
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#737686"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ marginLeft: 8, padding: 4 }}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#737686"
                    />
                  </Pressable>
                </View>

                {/* Forgot Password Link - Bulletproof Right Alignment */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignSelf: "stretch",
                    marginTop: 8,
                  }}
                >
                  <Pressable
                    onPress={() =>
                      router.push("/(templates)/auth-forgot-password" as never)
                    }
                    accessibilityRole="button"
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#004ac6",
                      }}
                    >
                      Forgot password?
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Sign In Button */}
            <View style={{ marginTop: 24, marginBottom: 12 }}>
              <Button
                variant="primary"
                fullWidth
                loading={isLoading}
                onPress={handleSignIn}
              >
                Sign In
              </Button>
            </View>

            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 24,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "#c3c6d7",
                  opacity: 0.6,
                }}
              />
              <Text
                style={{
                  marginHorizontal: 12,
                  fontSize: 12,
                  color: "#737686",
                  fontWeight: "600",
                }}
              >
                or continue with
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "#c3c6d7",
                  opacity: 0.6,
                }}
              />
            </View>

            {/* Social Login Buttons */}
            <View style={{ gap: 12 }}>
              {/* Google Button */}
              <Button
                variant="outline"
                fullWidth
                leftIcon={
                  <Ionicons name="logo-google" size={18} color="#EA4335" />
                }
                onPress={() => {}}
              >
                Google
              </Button>

              {/* Facebook Button */}
              <Button
                variant="outline"
                fullWidth
                leftIcon={
                  <Ionicons name="logo-facebook" size={18} color="#1877F2" />
                }
                onPress={() => {}}
              >
                Facebook
              </Button>
            </View>

            {/* Footer Register Link */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 32,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#737686",
                  fontWeight: "500",
                }}
              >
                Don{"'"}t have an account?{" "}
              </Text>
              <Pressable
                onPress={() =>
                  router.push("/(templates)/auth-register" as never)
                }
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#004ac6",
                  }}
                >
                  Sign up
                </Text>
              </Pressable>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageShell>
  );
}
