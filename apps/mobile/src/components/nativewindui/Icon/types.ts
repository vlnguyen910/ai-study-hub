import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolViewProps } from "expo-symbols";

type MaterialCommunityIconsProps = React.ComponentProps<
  typeof MaterialCommunityIcons
>;
type MaterialIconsProps = React.ComponentProps<typeof MaterialIcons>;

type Style = SymbolViewProps["style"] &
  MaterialIconsProps["style"] &
  MaterialCommunityIconsProps["style"];

type IconProps = {
  name?: string;
  sfSymbol?: Partial<Omit<SymbolViewProps, "name"> & { name: string }>;
  materialIcon?: Partial<MaterialIconsProps> & Pick<MaterialIconsProps, "name">;
  materialCommunityIcon?: Partial<MaterialCommunityIconsProps> &
    Pick<MaterialCommunityIconsProps, "name">;
  size?: number;
  color?: string;
  style?: Style;
  className?: string;
};

export type { IconProps };
