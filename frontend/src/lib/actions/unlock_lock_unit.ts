"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type UnlockUnit = {
  id: string;
};

export async function unlock_unit(req: UnlockUnit) {
  "use server";
  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${req.id}/unlock`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  if (!data.ok) {
    return {
      success: false,
    };
  } else {
    return {
      success: true,
    };
  }
}

export async function lock_unit(req: UnlockUnit) {
  "use server";
  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${req.id}/lock`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  if (!data.ok) {
    return {
      success: false,
    };
  } else {
    return {
      success: true,
    };
  }
}
