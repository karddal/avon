"use server";

import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import UnitList from "@/components/units/unit-list";
import { requireSession } from "@/lib/auth-utils";

async function PageContent() {
  await requireSession(); // make sure logged in

  return <UnitList></UnitList>;
}

export default async function UnitPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
}
