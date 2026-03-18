import {getRequestJWT} from "@/lib/auth-utils";
import {get_username_from_id} from "@/lib/actions/get_username";

export type StudentNameAndRepo = {
  student: string;
  repo_url: string;
}

export type StudentsRepositoriesResp = {
  repos: StudentNameAndRepo[];
}

export type GetCWEngineDataRequest = {
  coursework_id: string;
}

type StudentRepoResp = {
  student_id: string;
  repo_url: string;
  cw_id: string;
}

type GetCWEngineDataResponse = {
  repos: StudentRepoResp[];
}

export async function get_student_repos(request: GetCWEngineDataRequest): Promise<StudentsRepositoriesResp> {
  const token = await getRequestJWT();

  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/coursework/${request.coursework_id}/student_repos`,
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
    throw new Error("Could not fetch student repos data.")
  }

  const data: GetCWEngineDataResponse = await response.json();

  // Deduplicate data, if two students have same repo they should join together
  let m = new Map<string, Array<string>>
  for (const student of data.repos) {
    let l = m.get(student.repo_url)
    if (!l) {
      m.set(student.repo_url, [student.student_id])
    } else {
      l.push(student.student_id)
    }
  }

  // Now we have a map of repo url -> student id []
  // we want to turn it into a list of student names and repos

  let out: StudentNameAndRepo[] = []
  for (const [repo_url, student_list] of m.entries()) {
    let names = []
    for (const student of student_list) {
      names.push(await get_username_from_id(student));
    }
    out.push({
      student: names.join(", "),
      repo_url: repo_url,
    })
  }
  return {
    repos: out
  };
}