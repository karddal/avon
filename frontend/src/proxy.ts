import type { JwtPayload } from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

interface decodedPayload extends JwtPayload {
  is_lecturer: boolean;
}

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/units/:path*",
    "/dashboard",
    "/coursework/:path*",
    "/analytics/:path*",
  ],
};
