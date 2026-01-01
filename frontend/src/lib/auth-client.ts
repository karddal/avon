import {createAuthClient} from "better-auth/react"
import {auth} from "@/lib/auth";
export const authClient = createAuthClient(
)

export interface SignInData {
    email: string,
    password: string,
}

export async function signIn(formData: SignInData) {
    try {
        await auth.api.signInEmail({
            body: {
                email: formData.email,
                password: formData.password,
            }
        })

        const session = await auth.api.getSession()
        if (!session) {throw new Error ("No session")}
    } catch (err: any) {
        return {
            error: "Authentication failed. Check your credentials."
        }
    }
}