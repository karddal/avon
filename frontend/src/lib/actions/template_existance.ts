"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type CourseworkTemplateExistanceRequest = {
  courseworkGitLabId: string;
};

type CourseworkTemplateExistanceResponse = {
  exists: boolean;
};

export async function template_existance(
  req: CourseworkTemplateExistanceRequest
): Promise<CourseworkTemplateExistanceResponse> {

  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/template/exists?gitLabId=${req.courseworkGitLabId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-cache",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check template existence");
  }

  return await response.json();
}
