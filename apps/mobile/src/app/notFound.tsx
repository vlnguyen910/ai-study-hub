import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-slate-900">
        Trang không tồn tại
      </Text>
      <Text className="mt-2 text-center text-base text-slate-600">
        Kiểm tra lại đường dẫn hoặc quay về màn hình chính.
      </Text>
      <Link href="./" className="mt-6 text-base font-semibold text-blue-600">
        Quay về trang chủ
      </Link>
    </View>
  );
}
