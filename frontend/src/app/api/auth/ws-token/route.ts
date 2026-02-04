import {getRequestJWT} from "@/lib/auth-utils";
import {NextResponse} from "next/server";

export async function GET() {
    const token = await getRequestJWT()
    return NextResponse.json({token})
}