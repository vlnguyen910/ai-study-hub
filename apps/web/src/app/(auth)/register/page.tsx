import { Suspense, type ReactElement } from "react";

import RegisterPageClient from "./RegisterPageClient";
import { GuestRoute } from "@/routes/GuestRoute";

export default function RegisterPage(): ReactElement {
  return (
    <GuestRoute>
      <Suspense fallback={null}>
        <RegisterPageClient />
      </Suspense>
    </GuestRoute>
  );
}
