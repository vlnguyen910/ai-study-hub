import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface PageShellProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
}

export function PageShell({
  children,
  className = "",
  contentClassName = "",
}: PageShellProps) {
  return (
    <SafeAreaView className={`flex-1 bg-surface ${className}`}>
      <View className={`flex-1 px-4 py-5 ${contentClassName}`}>{children}</View>
    </SafeAreaView>
  );
}
