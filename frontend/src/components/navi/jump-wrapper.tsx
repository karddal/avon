"use server";

import { Suspense } from "react";
import JumpUnits from "@/components/navi/jump-units";
import { getRequestJWT } from "@/lib/auth-utils";

type Unit = {
  id: string;
  name: string;
  description: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  programme_id: string;
};

type UnitsResponse = {
  units: Unit[];
};

type Coursework = {
  id: string;
  name: string;
  description: string;
  unit_id: string;
  creation_date: string;
  due_date: string;
  colour: string;
};

export async function JumpWrapper() {
  const token = await getRequestJWT();

  const units_data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/units/active`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: {
        revalidate: 120,
      },
    },
  );
  const unitData: UnitsResponse = await units_data.json();

  const courseworks_data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/courseworks/active`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: {
        revalidate: 120,
      },
    },
  );
  const courseworkData: Coursework[] = await courseworks_data.json();
  console.log(courseworkData);

  return (
    <JumpUnits units={unitData.units} coursework={courseworkData}></JumpUnits>
  );
}

export default async function Jump() {
  return (
    <Suspense>
      <JumpWrapper></JumpWrapper>
    </Suspense>
  );
}
