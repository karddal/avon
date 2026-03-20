// Some code
"use server";

import { getRequestJWT } from "@/lib/auth-utils";

type ServerResponse = {
  created: string[];
  failed: string[];
}

type ProjectCreateForSpecificStudRequest = {
  name: string;
  coursework_id: string;
  template_id: string;
  student_ids: string[];
};

export async function provision_individual_projects_for_specific(req: ProjectCreateForSpecificStudRequest) {
  "use server";

  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/create-fork-for-student`,
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
