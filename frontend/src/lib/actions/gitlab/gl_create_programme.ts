"use server";

type ProgrammeData = {
  name: string;
  start_date: string;
  end_date: string;
};

const token = process.env.GITLAB_API_TOKEN;
const baseUrl = process.env.GITLAB_BASE_URL;
const rootId = process.env.GITLAB_ROOT_ID;

export async function gl_create_programme(programmeData: ProgrammeData) {
  if (!token || !baseUrl) {
    console.error(
      "Missing Environment Variables",
      process.env.GITLAB_API_TOKEN,
    );
    return { success: false, error: process.env.GITLAB_API_TOKEN };
  }

  if (!programmeData.name) {
    return { success: false, error: "Programme name is required" };
  }

  const path = programmeData.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    const response = await fetch(`${baseUrl}/groups`, {
      method: "POST",
      headers: {
        "PRIVATE-TOKEN": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: programmeData.name,
        path: path,
        parent_id: rootId,
        visibility: "private",
        description: `Root group for the ${programmeData.name} programme.`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("GitLab API Error Details:", data);
      return {
        success: false,
        error: data.message || "Failed to create GitLab group",
      };
    }

    return {
      success: true,
      gitlabGroupId: data.id,
      webUrl: data.web_url,
      path: data.path,
    };
  } catch (error) {
    console.error("Network Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
