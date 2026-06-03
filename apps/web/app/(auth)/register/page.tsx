import RegisterPageComponent from "../../modules/register/page";
import { GuestRoute } from "@/routes/GuestRoute";

export default function RegisterPage(): React.JSX.Element {
  return (
    <GuestRoute>
      <RegisterPageComponent />
    </GuestRoute>
  );
}
