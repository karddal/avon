import { Suspense } from "react";
import {IntForm, UnitOption} from "@/app/coursework/create-coursework/form";
import { getRequestJWT } from "@/lib/auth-utils";
import ModalShell from "@/components/modal-shell";

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
