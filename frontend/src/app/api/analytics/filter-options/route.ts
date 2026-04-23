"use server";

import { NextResponse } from "next/server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function GET() {
  const token = await getRequestJWT();

  const unitsRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/units/active`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const courseworksRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/courseworks/active`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const unitsData = unitsRes.ok
    ? ((await unitsRes.json()) as {
        units: Array<{ id: string; name: string; unit_code: string }>;
      })
    : { units: [] };

  const courseworksData = courseworksRes.ok
    ? ((await courseworksRes.json()) as Array<{
        id: string;
        name: string;
        unit_id: string;
      }>)
    : [];

  return NextResponse.json({
    units: unitsData.units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      unit_code: unit.unit_code,
    })),
    courseworks: courseworksData.map((coursework) => ({
      id: coursework.id,
      name: coursework.name,
      unit_id: coursework.unit_id,
    })),
  });
}
