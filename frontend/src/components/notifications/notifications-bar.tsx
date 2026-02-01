import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationMessage from "./notification-message";
import {Suspense} from "react";
import NotificationsContents from "@/components/notifications/notifications-content";

export default function NotificationBar() {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 hover:cursor-pointer hover:bg-accent hover:ease-in-out">
        <Bell className="h-[1.2rem] w-[1.2rem]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-5 h-64 w-96 lg:h-128 lg:w-128 flex flex-col p-1">
        <Suspense>
          <NotificationsContents/>
        </Suspense>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
