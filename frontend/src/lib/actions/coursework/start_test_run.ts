"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type StartTestRunRequest = {
  repo_ids: string[];
  notifications_enabled: boolean;
};

type SuccessResponse = {
  started: number;
  failed: number;
};

export async function send_test_run_start_req(
  coursework_id: string,
  repo_ids: string[],
  notifications_enabled: boolean,
) {
  "use server";
  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${coursework_id}/start_test_batch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({
        repo_ids: repo_ids,
        notifications_enabled: notifications_enabled,
      }),
    },
  );
  if (!data.ok) {
    const json = await data.json();
    throw new Error(`could not start test run: ${json.detail ?? "no info"}`);
  } else {
    const d: SuccessResponse = await data.json();
    return d;
  }
}
