import type { ReactElement } from "react";
import ResetPasswordPage from "../../../modules/reset-password/page";

export default async function Page({
  params,
}: Readonly<{
  params: Promise<{ token: string }>;
}>): Promise<ReactElement> {
  const { token } = await params;
  return <ResetPasswordPage token={token} />;
}
