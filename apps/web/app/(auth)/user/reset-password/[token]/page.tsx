import type { ReactElement } from "react";
import ResetPasswordPage from "../../../../modules/reset-password/page";

export default function Page({
  params,
}: Readonly<{
  params: { token: string };
}>): ReactElement {
  return <ResetPasswordPage token={params.token} />;
}
