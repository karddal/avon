"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type DeleteBaseImageRequest = {
  id: string;
};

export async function delete_base_image(req: DeleteBaseImageRequest) {
  "use server";
  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/base_image/${req.id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
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
