"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type setupProgressResponse = {
  title: string;
  completed: boolean;
};

export async function cw_setup_progress(
  cw_id: string,
): Promise<setupProgressResponse[]> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/progress?courseworkId=${cw_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch setup progress");
  }

  const setupData: setupProgressResponse[] = await response.json();

  return setupData;
}
