import { NextResponse } from "next/server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function GET(
  _request: Request,
  context: { params: Promise<{ unitId: string }> },
) {
  const { unitId } = await context.params;
  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${unitId}/with_dates`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
