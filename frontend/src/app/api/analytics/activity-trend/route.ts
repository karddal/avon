"use server";

import { type NextRequest, NextResponse } from "next/server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const token = await getRequestJWT();
  const reqURL = new URL(req.url);
  const fromDate = reqURL.searchParams.get("from_date");
  const toDate = reqURL.searchParams.get("to_date");

  const backendURL = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/analytics/activity_trend`,
  );

  if (fromDate) {
    backendURL.searchParams.set("from_date", fromDate);
  }
  if (toDate) {
    backendURL.searchParams.set("to_date", toDate);
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
      detail: bodyText || "Failed to fetch analytics activity trend",
    };
  }

  return NextResponse.json(data, { status: res.status });
}
