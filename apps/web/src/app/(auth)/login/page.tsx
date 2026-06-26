import { Suspense, type ReactElement } from "react";

import LoginPageClient from "./LoginPageClient";
import { GuestRoute } from "@/routes/GuestRoute";

export default function LoginPage(): ReactElement {
  return (
    <GuestRoute>
      <Suspense fallback={null}>
        <LoginPageClient />
      </Suspense>
    </GuestRoute>
  );
}
