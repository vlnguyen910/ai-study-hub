import type { ReactElement } from "react";
import VerifyEmailPage from "../../../modules/verify-email/page";

export default async function Page({
  params,
}: Readonly<{
  params: Promise<{ token: string }>;
}>): Promise<ReactElement> {
  const { token } = await params;
  return <VerifyEmailPage initialEmail={token.includes("@") ? token : ""} />;
}
