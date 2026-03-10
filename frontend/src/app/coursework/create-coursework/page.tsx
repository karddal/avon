import { Suspense } from "react";
import { getRequestJWT } from "@/lib/auth-utils";
import { IntForm, type UnitOption } from "./form";

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

  if (!response.ok) {
    throw new Error("Failed to fetch units.");
  }

  const units: UnitOption[] = await response.json();
  return <IntForm units={units} />;
}

export default async function CreateCourseworkFlow() {
  return (
    <Suspense>
      <Actual />
    </Suspense>
  );
}
