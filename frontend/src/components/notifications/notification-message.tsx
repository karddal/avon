import {Dot, Mail} from "lucide-react";
import {Notification2} from "@/components/notifications/notifications-content";
import {Item, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "../ui/item";

export default function NotificationMessage({
  data,
}: {
  data: Notification2;
}) {
  const unreadMessage = data.viewed ? "hidden" : "";
  return (
    <Item variant={"outline"}>
      <ItemContent>
        <ItemTitle>{data.title}</ItemTitle>
        <ItemDescription>{data.body}</ItemDescription>
      </ItemContent>
    </Item>


  );
}
