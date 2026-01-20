import { Suspense } from "react";
import { IntForm } from "./form";

export default async function CreateUnit({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <>
            <Suspense>
                <IntForm slug={params}></IntForm>
            </Suspense>
        </>
    )
}