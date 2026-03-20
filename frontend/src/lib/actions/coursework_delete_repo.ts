import {getRequestJWT} from "@/lib/auth-utils";

type Params = {
  coursework_id: string;
  repo_id: string;
}

type Result = {
  status: "ok" | "error";
  details: string | null;
}

export async function coursework_delete_repo(req: Params) {
  const token = await getRequestJWT();
  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/coursework/${req.coursework_id}/del_repo/${req.repo_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      },
  );
  if (!response.ok) {
    throw new Error("could not delete cw, unhandled err in backend")
  }

  const json: Result = await response.json();
  return json;
}