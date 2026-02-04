"use server"

import {getRequestJWT} from "@/lib/auth-utils";
import {string} from "zod";
import {get_username_from_id} from "@/lib/actions/get_username";
import NotificationMessage from "@/components/notifications/notification-message";
import {JSX} from "react";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {BookDashed, Cog, Sticker} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/new_tabs";
import MarkAllAsRead from "@/components/notifications/mark-all-read";

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
    title: string
    body: string
    created_at: string
    viewed: boolean
}

type UnitWithNotifs = {
  unit_id: string;
  unit_name: string;
  unit_code: string;
  notifications: Notification2[];
}

type NotificationsResponse = {
    system_notifications: Notification2[];
    notifications: UnitWithNotifs[];
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
    const groups = data.notifications;
    const tabs = groups.map((group) => (
        <TabsTrigger className={"whitespace-normal! flex flex-col"} key={group.unit_id} value={group.unit_id}>
          <span>{group.unit_name}</span>
          {group.notifications.filter((notification) => notification.viewed == false).length > 0 && (
              <span className={"absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex justify-center items-center items"}>{group.notifications.filter((notification) => notification.viewed == false).length}</span>
          )}
        </TabsTrigger>
    ));

    const system_entries = (data.system_notifications.length === 0 ? (<Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Sticker/>
        </EmptyMedia>
        <EmptyTitle>You have no notifications.</EmptyTitle>
        <EmptyDescription>
          You have no system notifications yet. Check back soon!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>) : ( data.system_notifications.map((notification) => (
        <NotificationMessage key={notification.id} data={notification}></NotificationMessage>
    ))));

    const entries = groups.map((notifs) => {
      notifs.notifications = notifs.notifications.sort((a, b) => {return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())}).reverse()
      const data = notifs.notifications.map((item) => (
              <NotificationMessage key={item.id} data={item}></NotificationMessage>
          ));
      return (<TabsContent className={"flex flex-col gap-2"} key={notifs.unit_id} value={notifs.unit_id}>
        {data}
      </TabsContent>)
    });
    console.log(entries.length)
    return (
        <div>
            {groups.length === 0 && data.system_notifications.length === 0 ? (
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
                  <Tabs orientation={"vertical"} className={"flex md:flex-row flex-col"}>
                    <TabsList className={"md:max-w-1/3"}>
                      {/*Mark all as read button*/}
                      <MarkAllAsRead/>
                      <TabsTrigger className={"whitespace-normal! flex flex-col"} key={"system"} value={"system"}>
                        <span>System Notifications</span>
                        {data.system_notifications.filter((notification) => notification.viewed == false).length > 0 && (
                            <span className={"absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex justify-center items-center items"}>{data.system_notifications.filter((notification) => notification.viewed == false).length}</span>
                        )}
                      </TabsTrigger>
                      {tabs}
                    </TabsList>
                    <TabsContent value={"system"}>
                      {system_entries}
                    </TabsContent>
                    {entries}
                  </Tabs>
                </div>
            )}
        </div>
    )
}