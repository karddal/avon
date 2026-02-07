import { type NextRequest, NextResponse } from "next/server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const token = await getRequestJWT();

  const reqURL = new URL(req.url);
  const form = reqURL.searchParams.get("from_");
  const to = reqURL.searchParams.get("to");
  const unit_ids = reqURL.searchParams.getAll("unit_id");

  const backendURL = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/events`,
  );
  if (form) backendURL.searchParams.set("from_", form);
  if (to) backendURL.searchParams.set("to", to);
  if (unit_ids) {
    for (const unit_id of unit_ids) {
      backendURL.searchParams.append("unit_id", unit_id);
    }
  }

  const res = await fetch(backendURL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
