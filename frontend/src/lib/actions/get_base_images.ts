import {getRequestJWT} from "@/lib/auth-utils";

export type BaseImage = {
  id: string;
  name: string;
  description: string;
  image_uri: string;
}

export type GetBaseImagesResponse = {
  images: BaseImage[];
}

export async function get_base_images() {
  const token = await getRequestJWT();

  const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/base_image/`,
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
    throw new Error("Could not fetch base images.")
  }

  const images: GetBaseImagesResponse = await response.json();

  return images;
}