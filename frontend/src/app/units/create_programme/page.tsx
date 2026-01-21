import { Suspense } from "react";
import { ProgForm } from "@/app/units/create_programme/form";
// import { IntForm } from "./form";
import { requireLecturerSession } from "@/lib/auth-utils";

async function Page() {
  await requireLecturerSession();
  return (
    <ProgForm></ProgForm>
  );
}

export default async function CreateCourseworkFlow() {
  return (
    <Suspense>
      <Page></Page>
    </Suspense>
  );
}
