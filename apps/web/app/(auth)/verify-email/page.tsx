import type { ReactElement } from "react";
import VerifyEmailPage from "../../modules/verify-email/page";

export default async function Page({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ email?: string }>;
}>): Promise<ReactElement> {
  const { email } = await searchParams;

  return <VerifyEmailPage initialEmail={email ?? ""} />;
}
