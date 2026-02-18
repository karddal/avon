"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type uploadZipRequest = {
  courseworkGitLabId: string;
  formData: FormData;
  cw_id: string;
};

type uploadZipResponse = {
  templateId: number;
};

export async function upload_zip(
  req: uploadZipRequest,
): Promise<uploadZipResponse> {
  "use server";
  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${req.cw_id}/template/upload-zip?courseworkGitLabId=${req.courseworkGitLabId}`,
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
    throw new Error("Failed to upload files");
  }

  return (await data.json()) as uploadZipResponse;
}
