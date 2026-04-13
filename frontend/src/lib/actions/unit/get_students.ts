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

  return studentData;
}

export async function get_addable_students_courswork_id(
  cw_id: string,
  gl_repo_id: string,
): Promise<studentsResponse> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${cw_id}/addable_students_for_repo/${gl_repo_id}`,
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

  alert(studentData.students);
  return studentData;
}
