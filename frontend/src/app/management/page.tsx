import { Suspense } from "react";
import ManagementComponent from "@/components/management/management-component";
import { requireAdminSession } from "@/lib/auth-utils";

async function PageContent() {
  await requireAdminSession();
  const isAdmin = true;
  return <ManagementComponent isAdmin={isAdmin} />;
}
export default function ManagementPage() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}
