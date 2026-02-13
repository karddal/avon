"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type TemplateFileTreeRequest = {
  templateProjectId: string;
};

type GitLabTreeItem = {
    id: string;
    name: string;
    type: "blob" | "tree";
    path: string;
    mode: string;
}

// type TemplateFileTreeResponse = {
//   templateTreeResponse: GitLabTreeItem[];
// };

export async function template_file_tree(
  req: TemplateFileTreeRequest
): Promise<GitLabTreeItem[]> {

  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/template/files?templateId=${req.templateProjectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-cache",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get template file tree");
  }

  return (await response.json()) as GitLabTreeItem[];
}
