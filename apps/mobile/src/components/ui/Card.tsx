import type { ReactNode } from "react";
import { Text, View } from "react-native";

export interface CardProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Card({ title, subtitle, children, className = "" }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 ${className}`}
    >
      {title ? (
        <View className="mb-3 gap-1">
          <Text className="text-lg font-semibold text-on-surface">{title}</Text>
          {subtitle ? (
            <Text className="text-sm text-on-surface-variant">{subtitle}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
