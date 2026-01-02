import {auth} from "@/lib/auth";
import { headers } from "next/headers";
import {redirect} from "next/navigation";

/**
 * This method can be used to get the current betterAuth session context.
 */
export async function requireSession() {
    const session = await auth.api.getSession(
        {
            headers: await headers()
        }
    );

    if (!session) {
        redirect("/login");
    }

    return session;
}

/**
 * This method returns the JWT token necessary to make API calls.
 */
export async function getRequestJWT() {
    const token = await auth.api.getToken({
        headers: await headers(),
    });

    return token.token;
}