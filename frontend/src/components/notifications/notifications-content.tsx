"use server"

import {getRequestJWT} from "@/lib/auth-utils";
import {string} from "zod";
import {get_username_from_id} from "@/lib/actions/get_username";
import NotificationMessage from "@/components/notifications/notification-message";
import {JSX} from "react";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {BookDashed, Sticker} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/new_tabs";

export type UnitInfo = {
    unit_id: string;
    unit_name: string;
    unit_code: string;
}

const system: UnitInfo = {
  unit_id: "7ea07bcf-9295-469a-8911-2b4431ef9f8e",
  unit_name: "System",
  unit_code: "System",
}

export type Notification2 = {
    id: string
    unit: UnitInfo | null
    title: string
    body: string
    created_at: string
    viewed: boolean
}

type NotificationsResponse = {
    notifications: Notification2[];
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

    const notifs = data.notifications;
    const groups = Map.groupBy(notifs, ((item) => item.unit ? item.unit : system ))
    const tabs = groups.keys().map((group) => (
        <TabsTrigger className={"whitespace-normal! flex flex-col"} key={group.unit_id} value={group.unit_id}>
          <span>{group.unit_name}</span>
        </TabsTrigger>
    )).toArray();
    const entries = groups.entries().map(([unit, notifs]) => {
      const data = notifs.map((item) => (
              <NotificationMessage key={item.id} data={item}></NotificationMessage>
          ));
      return (<TabsContent key={unit.unit_id} value={unit.unit_id}>
        {data}
      </TabsContent>)
    }).toArray();
    return (
        <div>
            {notifs.length === 0 ? (
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
                  <Tabs orientation={"vertical"}>
                    <TabsList className={"max-w-1/3"}>
                      {tabs}
                    </TabsList>
                    {entries}
                  </Tabs>
                </div>
            )}
        </div>
    )
}