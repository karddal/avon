"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type UpdateCourseworkRequest = {
  id: string;
  name: string;
  description: string;
  unit_id: string;
  due_date: string;
  colour: string;
};

export async function update_coursework(req: UpdateCourseworkRequest) {
  "use server";
  const token = await getRequestJWT();

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${req.id}`,
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
