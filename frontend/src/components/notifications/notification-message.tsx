import {Check, Dot, Mail} from "lucide-react";
import {Notification2} from "@/components/notifications/notifications-content";
import {Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "../ui/item";
import {Button} from "@/components/ui/button";

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
      <ItemActions>
        <Button size={"icon-sm"} variant={"ghost"}><Check/></Button>
      </ItemActions>
    </Item>


  );
}
