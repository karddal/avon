"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type ActivateTemplateRequest = {
  courseworkGitLabId: string;
  cw_id: string;
};

type ActivateTemplateResponse = {
  templateGitLabId: string;
};

export async function activate_template_request(
  req: ActivateTemplateRequest,
): Promise<ActivateTemplateResponse> {
  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${req.cw_id}/template/activate?gitLabId=${req.courseworkGitLabId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-cache",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to activate template project");
  }

  return await response.json();
}
