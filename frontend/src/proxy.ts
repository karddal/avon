import type { JwtPayload } from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface decodedPayload extends JwtPayload {
  is_lecturer: boolean;
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    console.log("reached here");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const decodedToken: decodedPayload = jwtDecode(token);
  const userRole = decodedToken.is_lecturer ? "lecturer" : "student";

  // This lets us add headers to the response, so we can specify if it's a lecturer or student
  const response = NextResponse.next();
  response.headers.set("x-user-role", userRole);

  return response;
}

export const config = {
  matcher: [
    "/units/:path*",
    "/dashboard",
    "/coursework/:path*",
    "/analytics/:path*",
  ],
};
