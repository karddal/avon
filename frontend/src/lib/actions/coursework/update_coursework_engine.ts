"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type UpdateCourseworkEngineRequest = {
  base_image_id: string;
  tester_command: string;
};

export async function update_coursework_engine(
  id: string,
  req: UpdateCourseworkEngineRequest,
) {
  const token = await getRequestJWT();

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${id}/update_engine`,
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
