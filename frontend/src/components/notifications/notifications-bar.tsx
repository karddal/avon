import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationMessage from "./notification-message";
import {Suspense} from "react";
import NotificationsContents from "@/components/notifications/notifications-content";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export default function NotificationBar() {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 hover:cursor-pointer hover:bg-accent hover:ease-in-out">
        <Bell className="h-[1.2rem] w-[1.2rem]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"w-full"}>
          <Card className={"w-[75vw]"}>
            <CardHeader>
              <CardTitle>Notification center</CardTitle>
              <CardDescription>You can view your notifications here</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense>
                <NotificationsContents/>
              </Suspense>
            </CardContent>
          </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
