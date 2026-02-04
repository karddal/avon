import {getRequestJWT} from "@/lib/auth-utils";

export async function set_all_read(
) {
  const token = await getRequestJWT();
  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/me/notifications/mark_all_read`,
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