"use server";

import { getRequestJWT, requireSession } from "@/lib/auth-utils";

export type ActiveUnit = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  academic_year: string | number;
};

export async function get_active_units() {
  const token = await getRequestJWT();
  const session = await requireSession();
  const role = session.user.role;
  const hasPermissions = role === "admin";
  const route = role === "admin" ? "units/active" : "me/units/active";

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${route}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const unitData = (await response.json()) as { units: ActiveUnit[] };

  return {
    hasPermissions,
    units: unitData.units,
  };
}
