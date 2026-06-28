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
      className={`rounded-3xl border border-outline-variant/80 bg-surface-container-lowest p-5 shadow-sm shadow-black/5 ${className}`}
    >
      {title ? (
        <View className="mb-4 gap-1">
          <Text className="text-lg font-bold text-on-surface">{title}</Text>
          {subtitle ? (
            <Text className="text-sm leading-5 text-on-surface-variant">
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
