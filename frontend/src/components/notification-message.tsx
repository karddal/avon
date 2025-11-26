import { Dot } from "lucide-react";

type notificationData = {
  title: string;
  day: string;
  time: string;
  from: string;
  message: string;
  read: boolean;
};

export default function NotificationMessage({
  props,
}: {
  props: notificationData;
}) {
  const unreadMessage = props.read ? "hidden" : "";
  return (
    <div className="flex flex-col p-2 m-2 border border-slate-300 hover:bg-slate-200 hover:cursor-pointer">
      <div className="flex flex-col lg:flex-row  justify-between align-bottom items-center">
        <div className="flex flex-row">
          <div className={`${unreadMessage}`}>
            <Dot color="#ff0000" size={35} strokeWidth={3} fill="#ff0000" />
          </div>
          <p className="text-md lg:text-lg">{props.title}</p>
        </div>
        {/* Add date and time logic */}
        <p className="">4 hours ago</p>
      </div>
      <div>
        <p className="flex flex-row gap-x-1">
          From
          <span className="underline">{props.from}</span>
        </p>
        <p className="pt-2">{props.message}</p>
      </div>
    </div>
  );
}
