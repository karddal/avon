"use server";

import { getRequestJWT, requireAdminSession } from "@/lib/auth-utils";

export type UploadProfileImageResponse = {
  success: boolean;
  error?: string;
  imageUrl?: string;
};

function buildCdnUrl(key: string) {
  const cdnBase = process.env.NEXT_PUBLIC_CDN_PATH?.replace(/\/$/, "");
  return cdnBase ? `${cdnBase}/${key}` : `/${key.replace(/^\/+/, "")}`;
}

const ALLOWED_PROFILE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function upload_profile_image(
  formData: FormData,
): Promise<UploadProfileImageResponse> {
  await requireAdminSession();

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      success: false,
      error: "No image file provided",
    };
  }

  if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type)) {
    return {
      success: false,
      error: "Unsupported image type",
    };
  }

  const token = await getRequestJWT();
  const uploadFormData = new FormData();
  uploadFormData.append("file", file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/profile-image/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: uploadFormData,
      cache: "no-cache",
    },
  );

  const json = (await response.json()) as { detail?: string; key?: string };

  if (!response.ok || !json.key) {
    return {
      success: false,
      error: json.detail ?? "Failed to upload profile image",
    };
  }

  return {
    success: true,
    imageUrl: buildCdnUrl(json.key),
  };
}
