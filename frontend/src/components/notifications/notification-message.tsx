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
import { formatIsoDateTime } from "@/lib/date-format";
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
  const [submittedState, setSubmittedState] = useState<boolean>(false);
  const router = useRouter();
  return (
    <Item className={"mb-2"} variant={"outline"}>
      <ItemContent className={"max-h-[50lh] overflow-y-scroll"}>
        <ItemTitle>
          {!data.viewed && <Dot className={"text-red-500"} />}
          {data.title}
        </ItemTitle>
        <p className="whitespace-pre-wrap overflow-y-scroll h-full w-full hyphens-auto">
          {data.body}
        </p>
        <ItemFooter>
          <span className={"font-light"}>
            Received {formatIsoDateTime(data.created_at)}
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
              setAsRead(router, data.id, setSubmittedState)
            }
            data-cy="notification-mark-read"
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
