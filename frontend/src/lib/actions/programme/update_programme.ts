"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type UpdateProgrammeRequest = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

export async function update_programme(req: UpdateProgrammeRequest) {
  "use server";
  const token = await getRequestJWT();
  console.log("current request");
  // console.log(req);
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/programmes/${req.id}`,
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
