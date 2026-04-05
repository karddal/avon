import { Suspense } from "react";
import { IntForm } from "@/app/coursework/create-coursework/form";
import type { UnitOption } from "@/components/coursework/create/types";
import ModalShell from "@/components/coursework/modal-shell";
import { getRequestJWT } from "@/lib/auth-utils";

async function Actual() {
  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/units`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  const units: UnitOption[] = await response.json();
  return (
    <ModalShell>
      <IntForm units={units} />
    </ModalShell>
  );
}

export default async function CreateCourseworkFlow() {
  return (
    <Suspense>
      <Actual />
    </Suspense>
  );
}
