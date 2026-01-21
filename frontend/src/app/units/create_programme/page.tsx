import { Suspense } from "react";
import { progForm } from "@/app/units/create_programme/form";
// import { IntForm } from "./form";
import { requireAdminSession } from "@/lib/auth-utils";

async function Page() {
  await requireAdminSession();
  return (
    <progForm></progForm>
  );
}

export default async function CreateCourseworkFlow() {
  return (
    <Suspense>
      <Page></Page>
    </Suspense>
  );
}
