import { Dot } from "lucide-react";
import {PopulatedNotification} from "@/components/notifications/notifications-content";

export default function NotificationMessage({
  data,
}: {
  data: PopulatedNotification;
}) {
  const unreadMessage = data.viewed ? "hidden" : "";
  return (
    <div className="flex flex-col p-2 m-2 border border-card hover:bg-card-foreground/10 hover:cursor-pointer">
      <div className="flex flex-col lg:flex-row  justify-between align-bottom items-center">
        <div className="flex flex-row">
          <div className={`${unreadMessage}`}>
            <Dot color="#ff0000" size={35} strokeWidth={3} fill="#ff0000" />
          </div>
          <p className="text-md lg:text-lg">{data.title}</p>
        </div>
        {/* Add date and time logic */}
        <p className="">4 hours ago</p>
      </div>
      <div>
        <p className="flex flex-row gap-x-1">
          From
          <span className="underline">{data.author_name}</span>
        </p>
        <p className="pt-2">{data.body}</p>
      </div>
    </div>
  );
}
