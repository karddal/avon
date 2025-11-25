import { cookies, headers } from "next/headers"
import { jwtDecode } from "jwt-decode"


export async function getCurrentUser() {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role")

    return userRole
}

