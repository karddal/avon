"use server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function remove_user_enrollment(unit_id: string, user_id: string) {
  const token = await getRequestJWT();

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/unit_enrollment/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({
        unit_id: unit_id,
        user_id: user_id,
      }),
    },
  );
  console.log("HERE", data);
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
