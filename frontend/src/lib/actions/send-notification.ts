"use server"

import {getRequestJWT} from "@/lib/auth-utils";

type SendNotificationRequest = {
    unit_id: string;
    title: string;
    body: string;
}

export async function send_notification(req: SendNotificationRequest) {
    const token = await getRequestJWT();
    const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notification/create`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-cache",
            body: JSON.stringify(req),
        },
    );
    if (!data.ok) {
        return false
    }
    return true
}