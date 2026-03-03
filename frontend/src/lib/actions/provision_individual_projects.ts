// Some code
"use server"

import { getRequestJWT } from "@/lib/auth-utils";

type ProjectCreate = {
    name: string
    coursework_id: string
    template_id: string
}

export async function provision_individual_projects(req: ProjectCreate) {
    "use server"

    const token = await getRequestJWT();
    const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/create-fork`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-cache",
            body: JSON.stringify(req),
        }
    )

    if (!data.ok) {
        const json = await data.json();
        return {
            success: false,
            data: json,
        };
    } else {
        const json = await data.json();
        return {
            success: true,
            data: json,
        };
    }
}