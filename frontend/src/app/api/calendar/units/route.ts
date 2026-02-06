import {getRequestJWT} from "@/lib/auth-utils";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
    const token = await getRequestJWT()

    const backendURL = new URL(`${process.env.NEXT_PUBLIC_API_URL}/units/units`)

    const res = await fetch(backendURL, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
}