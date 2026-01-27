"use server";

const GITLAB_API_TOKEN = process.env.GITLAB_API_TOKEN;
const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL;

type CourseworkData = {
  id: string;
  name: string;
  gitlab_unit_id: string;
};

export async function gl_create_coursework(courseworkData: CourseworkData) {
  if (!courseworkData.name) {
    return { success: false, error: "Coursework name is required" };
  }

  const path = courseworkData.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    const response = await fetch(`${GITLAB_BASE_URL}/groups`, {
      method: "POST",
      headers: {
        "PRIVATE-TOKEN": GITLAB_API_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: courseworkData.name,
        path: path,
        parent_id: courseworkData.gitlab_unit_id,
        visibility: "private",
        description: `Root group for the ${courseworkData.name} unit.`,
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
