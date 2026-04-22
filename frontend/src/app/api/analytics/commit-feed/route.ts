"use server";

import { type NextRequest, NextResponse } from "next/server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const token = await getRequestJWT();
  const reqURL = new URL(req.url);
  const perRepo = reqURL.searchParams.get("per_repo") ?? "5";
  const limit = reqURL.searchParams.get("limit") ?? "40";

  const backendURL = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/commit_feed`,
  );
  backendURL.searchParams.set("per_repo", perRepo);
  backendURL.searchParams.set("limit", limit);

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
      detail: bodyText || "Failed to fetch analytics commit feed",
    };
  }

  return NextResponse.json(data, { status: res.status });
}
