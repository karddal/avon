"use client"

import {Button} from "@/components/ui/button";
import {CheckCheck} from "lucide-react";
import {useState} from "react";
import {Spinner} from "@/components/ui/spinner";
import {set_all_read} from "@/lib/actions/set-all-read";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export default function MarkAllAsRead() {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const router = useRouter();
  const click = async () => {
    setSubmitted(true);
    let result = await set_all_read();
    if (!result) {
      toast.error("Failed to mark all notifications as read.")
      setSubmitted(false);
    } else {}
      toast.success("Marked all notifications as read.")
      setSubmitted(false);
      router.refresh();
  }

  return (
      <div>
        {!submitted && (
            <Button onClick={() => click()} className={"px-1.5! py-2! mb-2 text-foreground"} variant={"outline"} size={"lg"}>
              <CheckCheck data-icon={"inline-start"}/> Mark all as read
            </Button>
        )}
        {submitted && (
            <Button disabled className={"px-1.5! py-2! mb-2 text-foreground"} variant={"outline"} size={"lg"}>
              <Spinner data-icon={"inline-start"}/> Mark all as read
            </Button>
        )}
      </div>
  )
}