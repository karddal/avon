"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type TemplateUrlRequest = {
  templateProjectId: string;
};

type TemplateUrlResponse = {
    http: string;
    ssh: string;
};

export async function template_url(
  req: TemplateUrlRequest
): Promise<TemplateUrlResponse> {

  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/template/urls?templateId=${req.templateProjectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-cache",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get temlatye urls");
  }

  return (await response.json()) as TemplateUrlResponse;
}
