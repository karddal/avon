"use server";

const GITLAB_API_TOKEN = process.env.GITLAB_API_TOKEN;
const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL;

type UnitData = {
  id: string;
  name: string;
  gitlab_programme_id: string;
};

export async function gl_create_unit(unitData: UnitData) {
  if (!unitData.name) {
    return { success: false, error: "Unit name is required" };
  }

  const path = unitData.name
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
        name: unitData.name,
        path: path,
        parent_id: unitData.gitlab_programme_id,
        visibility: "private",
        description: `Root group for the ${unitData.name} unit.`,
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
