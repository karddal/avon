import { NextResponse } from "next/server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function GET() {
  const token = await getRequestJWT();
  return NextResponse.json({ token });
}
