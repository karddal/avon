"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type uploadZipRequest = {
  templateId: number;
  formData: FormData;
};

type uploadZipResponse = {
  templateId: number;
  error: string | null;
};

type apiError = {
  status: number;
  detail: string;
};

export async function overwrite_zip(
  req: uploadZipRequest,
): Promise<uploadZipResponse> {
  "use server";
  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/template/overwrite-zip?templateId=${req.templateId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-cache",
      body: req.formData,
    },
  );
  if (!data.ok) {
    if (data.status === 453) {
      return {
        templateId: -1,
        error: `File upload failed: ${await data.json().then((err: apiError) => err.detail)}`,
      };
    }
    throw new Error(`Failed to upload zip`);
  }

  const json = await data.json();
  return {
    templateId: json.templateId,
    error: null,
  };
}
