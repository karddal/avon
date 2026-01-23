import { Suspense } from "react";
import { ProgForm } from "@/app/programmes/create_programme/form";
// import { IntForm } from "./form";
import { requireAdminSession } from "@/lib/auth-utils";

async function Page() {
  await requireAdminSession();
  return <ProgForm></ProgForm>;
}

export default async function CreateCourseworkFlow() {
  return (
    <Suspense>
      <Page></Page>
    </Suspense>
  );
}
