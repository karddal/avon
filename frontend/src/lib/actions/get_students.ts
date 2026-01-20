"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type studentsResponse = {
  students: string[];
};

export async function get_students(unit_id: string): Promise<studentsResponse> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${unit_id}/students`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  const studentData: studentsResponse = await response.json();
  console.log(studentData);

  return studentData;
}
