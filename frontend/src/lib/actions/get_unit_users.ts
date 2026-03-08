"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type usersResponse = {
  users: string[];
};

export async function get_unit_users(unit_id: string): Promise<usersResponse> {
  const token = await getRequestJWT();
  try {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/units/${unit_id}/users`,
        {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        cache: "no-cache",
        },
    );

    const studentData: usersResponse = await response.json();

    return studentData;
  } catch (error: any){
    return error
  }
}
