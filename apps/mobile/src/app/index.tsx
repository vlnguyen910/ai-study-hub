import { Redirect } from "expo-router";
import { ROUTES } from "@/constants/routes";

export default function IndexRoute() {
  return <Redirect href={ROUTES.HOME as never} />;
}
