import type { ReactElement } from "react";
import VerifyEmailPage from "../../../../modules/verify-email/page";

export default function Page({
  params,
}: Readonly<{
  params: { token: string };
}>): ReactElement {
  return <VerifyEmailPage token={params.token} />;
}
