"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type uploadZipRequest = {
  templateId: number;
  formData: FormData;
};

export async function overwrite_zip(req: uploadZipRequest) {
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
    return {
      success: false,
    };
  } else {
    return {
      success: true,
    };
  }
}
