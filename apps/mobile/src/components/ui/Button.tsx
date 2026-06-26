import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export interface ButtonProps {
  readonly children: ReactNode;
  readonly onPress?: () => void;
  readonly variant?: "primary" | "secondary" | "outline" | "ghost";
  readonly size?: "sm" | "md" | "lg";
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly leftIcon?: ReactNode;
  readonly rightIcon?: ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary-container",
  outline: "border border-outline bg-transparent",
  ghost: "bg-transparent",
};

const textVariantClasses: Record<
  NonNullable<ButtonProps["variant"]>,
  string
> = {
  primary: "text-on-primary",
  secondary: "text-on-secondary-container",
  outline: "text-on-surface",
  ghost: "text-on-surface-variant",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-5 py-4",
};

const labelClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base",
};

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      className={`rounded-2xl ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : "self-start"} ${isDisabled ? "opacity-60" : "opacity-100"}`}
      style={({ pressed }) => ({ opacity: pressed && !isDisabled ? 0.9 : 1 })}
    >
      <View className="flex-row items-center justify-center gap-2">
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              variant === "outline" || variant === "ghost"
                ? "#191b23"
                : "#ffffff"
            }
          />
        ) : leftIcon ? (
          <View>{leftIcon}</View>
        ) : null}
        <Text
          className={`font-semibold ${labelClasses[size]} ${textVariantClasses[variant]}`}
        >
          {children}
        </Text>
        {rightIcon ? <View>{rightIcon}</View> : null}
      </View>
    </Pressable>
  );
}
