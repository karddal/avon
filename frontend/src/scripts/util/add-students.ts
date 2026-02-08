"use server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function batch_add_students_to_unit(
    unit_id: string,
    users: string[],
) {
  const token = await getRequestJWT();

  const data = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/unit_enrollment/batch`,
      {
        method: "POST",
        cache: "no-cache",
        body: JSON.stringify({
          unit_id: unit_id,
          user_ids: users,
        }),
      },
  );
  if (!data.ok) {
    const json = await data.json();
    return {
      success: false,
      data: json,
    };
  } else {
    const json = await data.json();
    return {
      success: true,
      data: json,
    };
  }
}
