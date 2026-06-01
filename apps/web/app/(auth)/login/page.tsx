import LoginPageComponent from "../../modules/login/page";
import { GuestRoute } from "@/routes/GuestRoute";

export default function LoginPage(): React.JSX.Element {
  return (
    <GuestRoute>
      <LoginPageComponent />
    </GuestRoute>
  );
}
