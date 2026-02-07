import { type NextRequest, NextResponse } from "next/server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function GET() {
  const token = await getRequestJWT();

  const backendURL = new URL(`${process.env.NEXT_PUBLIC_API_URL}/units/units`);

  const res = await fetch(backendURL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
