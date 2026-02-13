import { Suspense } from "react";
import PaywallClient from "./PaywallClient";

export default function PaywallPage() {
  return (
    <Suspense fallback={<div />}>
      <PaywallClient />
    </Suspense>
  );
}
