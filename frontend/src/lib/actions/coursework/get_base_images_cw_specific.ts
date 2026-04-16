"use server"
import { getRequestJWT } from "@/lib/auth-utils";

export type BaseImage = {
  id: string;
  name: string;
  description: string;
  task_definition: string;
};

export type GetBaseImagesResponse = {
  images: BaseImage[];
};

export type GetBaseImagesRequest = {
  coursework_id: string;
};

export async function get_base_images_cw_specific(
  request: GetBaseImagesRequest,
) {
  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${request.coursework_id}/available_images`,
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
    throw new Error("Could not fetch base images.");
  }

  const images: GetBaseImagesResponse = await response.json();

  return images;
}
