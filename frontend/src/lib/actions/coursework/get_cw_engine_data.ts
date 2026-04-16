"use server"
import { getRequestJWT } from "@/lib/auth-utils";

export type GetCWEngineDataResponse = {
  cw_id: string;
  base_image_id: string | null;
  tester_command: string | null;
};

export type GetCWEngineDataRequest = {
  coursework_id: string;
};

export async function get_cw_engine_data(request: GetCWEngineDataRequest) {
  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${request.coursework_id}/engine_data`,
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
    throw new Error("Could not fetch CW engine data.");
  }

  const data: GetCWEngineDataResponse = await response.json();

  return data;
}
