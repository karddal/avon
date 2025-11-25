import { cookies } from "next/headers"
import { jwtDecode } from "jwt-decode"

export async function getUserFromToken() {
    const cookieStore = await cookies()
    const token = cookieStore.get("access_token")?.value
    if (!token) return null

    const decoded = jwtDecode(token)
    console.log(decoded)
}

