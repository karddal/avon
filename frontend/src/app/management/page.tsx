import ManagementComponent from "@/components/management/management-component";
import { requireSession } from "@/lib/auth-utils";
import { Suspense } from "react";

async function PageContent(){
  const s = await requireSession();
  const isAdmin = s.user.role === "admin" ? true : false;
  return (
    <ManagementComponent isAdmin={isAdmin}/>
  );
}
export default function ManagementPage() {
  return (
    <Suspense>
      <PageContent/>
    </Suspense>
  );
}
