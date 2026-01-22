"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type DeleteCourseworkRequest = {
  id: string;
};

type _CreateCourseworkResponse = {
  success: boolean;
};

export async function delete_coursework(req: DeleteCourseworkRequest) {
  "use server";
  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${req.id}`,
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
