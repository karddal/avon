"use server"

import {getRequestJWT} from "@/lib/auth-utils";
import {string} from "zod";
import {get_username_from_id} from "@/lib/actions/get_username";
import NotificationMessage from "@/components/notifications/notification-message";
import {JSX} from "react";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {BookDashed, Sticker} from "lucide-react";

type Notification = {
    id: string
    author_id: string
    title: string
    body: string
    created_at: string
    viewed: boolean
}

export type PopulatedNotification = {
    id: string
    author_name: string
    title: string
    body: string
    created_at: Date
    viewed: boolean
}

type NotificationsResponse = {
    notifications: Notification[];
}

export default async function NotificationsContents() {
    const token = await getRequestJWT()
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/me/notifications/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-cache",
        },
    );
    const data: NotificationsResponse = await response.json();

    // convert the notification user ids to names

    let notifs = data.notifications;
    let populated: Promise<PopulatedNotification>[] = notifs.map(async (notification) => {
        const author_name = await get_username_from_id(notification.author_id);
        return {
            id: notification.id,
            author_name: author_name,
            title: notification.title,
            body: notification.body,
            created_at: new Date(notification.created_at),
            viewed: notification.viewed
        };
    })

    let items: PopulatedNotification[] = []
    for (const item of populated) {
        let data = await item
        items.push(data);
    }

    return (
        <div>
            {items.length === 0 ? (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Sticker/>
                        </EmptyMedia>
                        <EmptyTitle>You have no notifications.</EmptyTitle>
                        <EmptyDescription>
                            You have no notifications yet. Check back soon!
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
                ) : (
                <div>
                {items.map((item) => (
                    <NotificationMessage data={item}></NotificationMessage>
                ))}
                </div>
            )}
        </div>
    )
}