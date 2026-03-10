import { Suspense } from "react";
import ManagementComponent from "@/components/management/management-component";
import { requireSession } from "@/lib/auth-utils";

async function PageContent() {
  const s = await requireSession();
  const isAdmin = s.user.role === "admin" ? true : false;
  return <ManagementComponent isAdmin={isAdmin} />;
}
export default function ManagementPage() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}
