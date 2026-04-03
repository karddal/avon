"use client";

import { Check, Dot } from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { toast } from "sonner";
import type { Notification2 } from "@/components/notifications/notifications-content";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { set_as_read } from "@/lib/actions/notification/set_as_read";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemTitle,
} from "../ui/item";

async function setAsRead(
  router: AppRouterInstance,
  id: string,
  _state: boolean,
  setState: Dispatch<SetStateAction<boolean>>,
) {
  setState(true);
  const response = await set_as_read(id);

  if (!response) {
    toast.error("Failed to mark notification as read.");
    setState(false);
  } else {
    router.refresh();
    setState(false);
  }
}

export default function NotificationMessage({ data }: { data: Notification2 }) {
  const _unreadMessage = data.viewed ? "hidden" : "";
  const [submittedState, setSubmittedState] = useState<boolean>(false);
  const router = useRouter();
  return (
    <Item className={"mb-2"} variant={"outline"}>
      <ItemContent>
        <ItemTitle>
          {!data.viewed && <Dot className={"text-red-500"} />}
          {data.title}
        </ItemTitle>
        <p className="overflow-y-scroll w-full break-all">{data.body}</p>
        <ItemFooter>
          <span className={"font-light"}>
            Received {new Date(data.created_at).toLocaleString()}
          </span>
        </ItemFooter>
      </ItemContent>
      <ItemActions>
        {submittedState && (
          <Button disabled={true} size={"icon-sm"} variant={"ghost"}>
            <Spinner />
          </Button>
        )}
        {!submittedState && !data.viewed && (
          <Button
            onClick={() =>
              setAsRead(router, data.id, submittedState, setSubmittedState)
            }
            size={"icon-sm"}
            variant={"ghost"}
          >
            <Check />
          </Button>
        )}
      </ItemActions>
    </Item>
  );
}
