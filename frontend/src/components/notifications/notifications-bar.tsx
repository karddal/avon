import { Mailbox } from "lucide-react";
import { Suspense } from "react";
import NotificationsBellIcon from "@/components/notifications/bell-icon";
import NotificationsContents from "@/components/notifications/notifications-content";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function NotificationBar() {
  return (
    <Dialog>
      <DialogTrigger className="p-2 hover:cursor-pointer hover:bg-accent hover:ease-in-out">
        <Suspense>
          <NotificationsBellIcon />
        </Suspense>
      </DialogTrigger>
      <DialogContent className={""}>
        <DialogHeader>
          <DialogTitle className={"flex flex-row items-center gap-2"}>
            <Mailbox />
            Postbox
          </DialogTitle>
          <DialogDescription>
            You can view your notifications here, and mark them as read.
          </DialogDescription>
        </DialogHeader>
        <Card
          className={"no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4"}
        >
          <CardContent className={"w-full px-0"}>
            <Suspense>
              <NotificationsContents />
            </Suspense>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
