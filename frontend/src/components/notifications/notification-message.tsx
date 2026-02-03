"use client"

import {Check, Dot, Mail} from "lucide-react";
import {Notification2} from "@/components/notifications/notifications-content";
import {Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "../ui/item";
import {Button} from "@/components/ui/button";
import {Dispatch, SetStateAction, useState} from "react";
import {set_as_read} from "@/lib/actions/set_as_read";
import {toast} from "sonner";
import {refresh, revalidatePath} from "next/dist/server/web/spec-extension/revalidate";
import {Spinner} from "@/components/ui/spinner";
import {useRouter} from "next/navigation";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";

async function setAsRead(router: AppRouterInstance, id: string, state: boolean, setState: Dispatch<SetStateAction<boolean>>) {
  setState(true);
  const response = await set_as_read(id);

  if (!response) {
    toast.error("Failed to mark notification as read.")
    setState(false);
  } else {
    router.refresh();
    setState(false);
  }
}

export default function NotificationMessage({
  data,
}: {
  data: Notification2;
}) {
  const unreadMessage = data.viewed ? "hidden" : "";
  const [submittedState, setSubmittedState] = useState<boolean>(false);
  const router = useRouter();
  return (
    <Item variant={"outline"}>
      <ItemContent>
        <ItemTitle>
          {!data.viewed && (<Dot className={"text-red-500"}/>)}
          {data.title}
        </ItemTitle>
        <ItemDescription className={"flex flex-col max-h-[50ex] overflow-y-scroll"}>
          {data.body}
          <span className={"font-light"}>Received on {new Date(data.created_at).toLocaleString()}</span>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {submittedState && (
            <Button disabled={true} size={"icon-sm"} variant={"ghost"}><Spinner/></Button>
        )}
        {!submittedState && !data.viewed && (
            <Button onClick={() => setAsRead(router, data.id, submittedState, setSubmittedState)} size={"icon-sm"} variant={"ghost"}><Check/></Button>
        )}
      </ItemActions>
    </Item>
  );
}
