import type { ReactElement } from "react";
import ResetPasswordPage from "../../../modules/reset-password/page";

export default function Page(): ReactElement {
  // `token` param is now extracted inside ResetPasswordPage component directly via useParams hook
  return <ResetPasswordPage />;
}
