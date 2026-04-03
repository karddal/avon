import { get_username_from_id } from "@/lib/actions/auth/get_username";
import { getRequestJWT } from "@/lib/auth-utils";
import {StudentNameAndPotentiallyRepo} from "@/components/coursework/student-list/columns";

type StudentIDAndMaybeRepo = {
  id: string;
  repo_url: string | null;
  repo_id: string | null;
};

type ServerResponse = {
  students: StudentIDAndMaybeRepo[];
};

export type GetAllStudsOnUnitWithMaybeRepoRequest = {
  coursework_id: string;
};

export async function get_all_students_with_maybe_repos(
  request: GetAllStudsOnUnitWithMaybeRepoRequest,
): Promise<StudentNameAndPotentiallyRepo[]> {
  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${request.coursework_id}/all_students_with_repos`,
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
    throw new Error("Could not fetch student repos data.");
  }

  const data: ServerResponse = await response.json();

  // Now we have a list of students, need to look up their names

  const out: StudentNameAndPotentiallyRepo[] = [];
  for (const s of data.students) {
    out.push({
      id: s.id,
      name: await get_username_from_id(s.id),
      repo_url: s.repo_url,
      repo_id: s.repo_id,
    });
  }
  return out;
}
