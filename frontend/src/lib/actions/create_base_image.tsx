"use server";
import { getRequestJWT } from "@/lib/auth-utils";
import {BaseImage} from "@/lib/actions/get_base_images_admin";

type CreateBaseImageRequest = {
  name: string;
  description: string;
  image_uri: string;
};

export async function create_base_image(req: CreateBaseImageRequest) {
  "use server";
  const token = await getRequestJWT();
  const data = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/base_image/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-cache",
        body: JSON.stringify(req),
      },
  );
  if (!data.ok) {
    const json = await data.json();
    return {
      success: false,
      data: json,
    };
  } else {
    const json: BaseImage = await data.json();
    return {
      success: true,
      data: json,
    };
  }
}
