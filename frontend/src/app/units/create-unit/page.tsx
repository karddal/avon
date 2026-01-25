import { Suspense } from "react";
import { IntForm } from "./form";
import { requireSession } from "@/lib/auth-utils";
import { redirect, RedirectType } from "next/navigation";

export default async function CreateUnit({ params }: { params: Promise<{ slug: string }> }) {
    const s = await requireSession()
    let userRole = s.user.role
    console.log("User Role:", userRole)
    if (userRole != "admin") {
        redirect("/units", RedirectType.replace)
    }
    return (
        <>
            <Suspense>
                <IntForm slug={params}></IntForm>
            </Suspense>
        </>
    )
}