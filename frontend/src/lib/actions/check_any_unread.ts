import {getRequestJWT} from "@/lib/auth-utils";

export type UnreadNotificationsQueryResponse = {
  have_unread_notifications: boolean;
}

export async function check_any_unread(
) {
  const token = await getRequestJWT();
  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/me/notifications/unread_exists`,
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
    throw new Error();
  }
  const data: UnreadNotificationsQueryResponse = await response.json();
  return data;
}