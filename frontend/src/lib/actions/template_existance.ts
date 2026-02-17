"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type CourseworkTemplateExistanceRequest = {
  id: string;
};

type CourseworkTemplateExistanceResponse = {
  exists: boolean;
  templateProjectId: number | null;
};

export async function template_existance(
  req: CourseworkTemplateExistanceRequest,
): Promise<CourseworkTemplateExistanceResponse> {
  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/${req.id}/coursework/template/exists`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-cache",
    },
  );
  const data = await response.json();
  console.log("Responssyy:", data);

  if (!response.ok) {
    throw new Error("Failed to check template existence");
  }

  return await data;
}
