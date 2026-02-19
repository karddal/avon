"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { send_notification } from "@/lib/actions/send-notification";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Notification title must be at least 1 character long.")
    .max(60, "Notification title must not be more than 60 characters long."),

  body: z
    .string()
    .min(1, "Notification body must not be empty.")
    .max(1000, "Notification body must not exceed 1000 characters."),
});

export default function SendNotification({
  unit_id,
  me,
  openState,
  setOpenState,
}: {
  unit_id: string;
  me: string;
  openState: boolean;
  setOpenState: Dispatch<SetStateAction<boolean>>;
}) {
  const [submitState, setSubmitState] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setSubmitState(true);
    const req = {
      unit_id: unit_id,
      title: data.title,
      body: data.body,
    };
    await send_notification(req).then((r) => {
      if (!r) {
        toast.error("Failed to send notification.");
        setSubmitState(false);
      } else {
        toast.success("Notification sent.");
        form.reset();
        setSubmitState(false);
        setOpenState(false);
      }
    });
  }

  return (
    <Dialog open={openState} onOpenChange={setOpenState}>
      <DialogContent className="max-h-[80%] md:overflow-auto overflow-y-scroll ">
        <form id="notification-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Send a notification</DialogTitle>
            <DialogDescription>
              Here, you can send a notification to all the students on this
              unit.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name={"title"}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={"notification-form-title"}>
                    Notification title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="notification-form-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="My new notification"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            ></Controller>
            <Controller
              name="body"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="notification-form-body">Body</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="notification-form-body"
                      placeholder="Surprise! You have a new coursework."
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value.length}/1000 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Give the body for your announcement.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {submitState && (
              <Button disabled={true}>
                <Spinner />
                <Send />
                Send
              </Button>
            )}
            {!submitState && (
              <Button type="submit">
                <Send />
                Send
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
