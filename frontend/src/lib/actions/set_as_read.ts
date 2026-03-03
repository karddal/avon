import { getRequestJWT } from "@/lib/auth-utils";

export async function set_as_read(notification_id: string) {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/notification/${notification_id}/mark_read`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  console.log(await response.json());
  return response.ok;
}
