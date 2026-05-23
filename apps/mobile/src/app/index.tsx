import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white px-6 py-10">
      <Text className="text-2xl font-bold text-slate-900">
        Mobile Boilerplate Starter
      </Text>
      <Text className="mt-3 text-base leading-6 text-slate-600">
        Route trong src/app chỉ nên đóng vai trò điều hướng và render screen từ
        feature module.
      </Text>

      <View className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick Links
        </Text>
        <Link
          href="./(templates)/feature-template"
          className="mt-3 text-base font-medium text-blue-600"
        >
          Xem màn hình template feature
        </Link>
      </View>
    </View>
  );
}
