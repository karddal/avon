"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type CreateProgrammeRequest = {
  name: string;
  start_date: string;
  end_date: string;
  // gitlab_id: string;
};

type _CreateProgrammeResponse = {
  success: boolean;
  //data: any;
};

export async function create_programme(req: CreateProgrammeRequest) {
  "use server";
  // console.log(req);
  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/programmes/create`,
    {
      method: "POST",
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
