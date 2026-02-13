"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type ActivateTemplateRequest = {
  courseworkGitLabId: string;
};

type ActivateTemplateResponse = {
  httpsCloneUrl: string;
  sshCloneUrl: string;
};

export async function activate_template_request(
  req: ActivateTemplateRequest
): Promise<ActivateTemplateResponse> {

  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/template/activate?gitLabId=${req.courseworkGitLabId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-cache",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to activate template project");
  }

  return await response.json();
}
