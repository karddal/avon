"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type ServerRequest = {
  new_active_status: boolean;
};

type ServerErrorResponse = {
  detail: string;
};

type ServerResponse = {
  base_image_id: string;
  new_is_active: boolean;
};

export async function set_base_image_status(
  base_image_id: string,
  new_status: boolean,
) {
  // This function sends an API request to set the status of the base image.
  // It requires the Admin FE role.
  const req: ServerRequest = {
    new_active_status: new_status,
  };

  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/base_image/${base_image_id}/mark_status`,
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
    const json: ServerErrorResponse = await data.json();
    throw new Error(`Could not update base image status: ${json.detail}`);
  } else {
    const json: ServerResponse = await data.json();
    return json.new_is_active;
  }
}
