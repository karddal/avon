"use server";

import { getRequestJWT, requireSession } from "@/lib/auth-utils";

export type ActiveCoursework = {
  id: string;
  name: string;
  description: string;
  due_date: string;
  creation_date: string;
  colour: string;
};

export type ActiveCourseworkUnit = {
  id: string;
  unit_code: string;
  name: string;
  unlocked: boolean;
  programme_start_date: string;
  programme_end_date: string;
  courseworks: ActiveCoursework[];
};

export async function get_active_coursework(finished = false) {
  const token = await getRequestJWT();
  const session = await requireSession();
  const role = session.user.role;
  const hasPermissions = role === "admin" || role === "lecturer";
  const route = role === "admin" ? "coursework/all" : "me/courseworks";

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${route}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const courseworkListData = (await response.json()) as ActiveCourseworkUnit[];
  const now = new Date();
  const units: ActiveCourseworkUnit[] = [];

  for (const unit of courseworkListData) {
    const filteredCourseworks = unit.courseworks.filter((coursework) => {
      const created = new Date(coursework.creation_date);
      const due = new Date(coursework.due_date);

      if (finished) {
        return now > due;
      }

      return now >= created && now <= due;
    });

    if (filteredCourseworks.length > 0) {
      units.push({
        ...unit,
        courseworks: filteredCourseworks,
      });
    }
  }

  return {
    hasPermissions,
    units,
  };
}
