"use server"

import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export interface SignInData {
    email: string,
    password: string,
}

export interface SignInResponse {
    redirect: string,
}

export async function signIn(formData: SignInData): Promise<SignInResponse> {
    try {
        const data = await auth.api.signInEmail({
            body: {
                email: formData.email,
                password: formData.password,
            },
            headers: await headers(),
        })

        if (!data) {
            throw new Error("No session")
        }

        if (data.user.role === "user") {
            return {redirect: "/units"}
        } else {
            return {redirect: "/dashboard"}
        }
    } catch (err: any) {
        throw new Error(err)
    }
}

export async function logout() {
    await auth.api.signOut({
        headers: await headers(),
    });
}