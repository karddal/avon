"use server";

import { type NextRequest, NextResponse } from "next/server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const token = await getRequestJWT();
  const reqURL = new URL(req.url);
  const limit = reqURL.searchParams.get("limit") ?? "40";
  const fresh = reqURL.searchParams.get("fresh") === "1";
  const unitId = reqURL.searchParams.get("unit_id");
  const courseworkId = reqURL.searchParams.get("coursework_id");

  const backendURL = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/test_run_feed`,
  );
  backendURL.searchParams.set("limit", limit);
  if (unitId) {
    backendURL.searchParams.set("unit_id", unitId);
  }
  if (courseworkId) {
    backendURL.searchParams.set("coursework_id", courseworkId);
  }
  if (fresh) {
    backendURL.searchParams.set("fresh", "1");
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
    data = bodyText ? JSON.parse(bodyText) : [];
  } catch {
    data = {
      detail: bodyText || "Failed to fetch analytics test run feed",
    };
  }

  return NextResponse.json(data, { status: res.status });
}
