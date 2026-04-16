"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type lecturersResponse = {
  lecturers: string[];
};

export async function get_lecturers(
  unit_id: string,
): Promise<lecturersResponse> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${unit_id}/lecturers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  const lecturerData: lecturersResponse = await response.json();

  return lecturerData;
}
