"use server";
import { getRequestJWT } from "../../auth-utils";

export type CourseworkUpdateReqResponse = {
  id: string;
  name: string;
  description?: string;
  unit_id: string;
  due_date: string;
  creation_date: string;
  colour: string;
  unit_name: string;
  unit_code: string;
  gitlabId: string;
  templateId: string;
  max_end_date: string;
};

export type CourseworkUpdateData = {
  id: string;
  name: string;
  description?: string;
  unit_id: string;
  due_date: string;
  creation_date: string;
  colour: string;
  unit_name: string;
  unit_code: string;
  gitlabId: string;
  max_end_date: Date;
  templateId: string;
};

export async function get_cw_update_data(
  slug: string,
): Promise<CourseworkUpdateData> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${slug}/update_form_data`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch cw update data");
  }
  const c: CourseworkUpdateReqResponse = await response.json();
  const end = new Date(c.max_end_date);
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    unit_id: c.unit_id,
    due_date: c.due_date,
    creation_date: c.creation_date,
    colour: c.colour,
    unit_name: c.unit_name,
    unit_code: c.unit_code,
    max_end_date: end,
    gitlabId: c.gitlabId,
    templateId: c.templateId,
  };
}
