"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type UpdateUnitRequest = {
  id: string;
  name: string;
  description: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

export async function update_unit(req: UpdateUnitRequest) {
  "use server";
  const token = await getRequestJWT();

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${req.id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify(req),
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
