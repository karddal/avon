"use server";

import { type NextRequest, NextResponse } from "next/server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const token = await getRequestJWT();
  const reqURL = new URL(req.url);
  const fromDate = reqURL.searchParams.get("from_date");
  const unitId = reqURL.searchParams.get("unit_id");
  const courseworkId = reqURL.searchParams.get("coursework_id");

  const backendURL = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/analytics/test_run_status_summary`,
  );

  if (fromDate) {
    backendURL.searchParams.set("from_date", fromDate);
  }
  if (unitId) {
    backendURL.searchParams.set("unit_id", unitId);
  }
  if (courseworkId) {
    backendURL.searchParams.set("coursework_id", courseworkId);
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
      detail: bodyText || "Failed to fetch analytics test run status summary",
    };
  }

  return NextResponse.json(data, { status: res.status });
}
