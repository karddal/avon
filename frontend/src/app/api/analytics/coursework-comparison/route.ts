"use server";

import { type NextRequest, NextResponse } from "next/server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const token = await getRequestJWT();
  const reqURL = new URL(req.url);
  const courseworkAId = reqURL.searchParams.get("coursework_a_id");
  const courseworkBId = reqURL.searchParams.get("coursework_b_id");

  const backendURL = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/analytics/coursework_comparison`,
  );

  if (courseworkAId) {
    backendURL.searchParams.set("coursework_a_id", courseworkAId);
  }
  if (courseworkBId) {
    backendURL.searchParams.set("coursework_b_id", courseworkBId);
  }

  const res = await fetch(backendURL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const bodyText = await res.text();
  let data: unknown;

  try {
    data = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    data = {
      detail: bodyText || "Failed to fetch analytics coursework comparison",
    };
  }

  return NextResponse.json(data, { status: res.status });
}
