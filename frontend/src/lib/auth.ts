import { headers } from "next/headers";

export async function getCurrentUser() {
  const headersList = await headers();
  const userRole = headersList.get("x-user-role");

  return userRole;
}
