"use client";

import type { RowSelectionState } from "@tanstack/table-core";
import { CircleQuestionMark, Layers, Send, TriangleAlert } from "lucide-react";
import { type Dispatch, type SetStateAction, Suspense, useState } from "react";
import { toast } from "sonner";
import { StudentReposTable } from "@/components/coursework/repos_table";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import type { BaseImage } from "@/lib/actions/coursework/get_base_images_cw_specific";
import type { GetCWEngineDataResponse } from "@/lib/actions/coursework/get_cw_engine_data";
import { send_test_run_start_req } from "@/lib/actions/coursework/start_test_run";

type Props = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  courseworkId: string;
  refresh: () => void;
  cw_engine_data: GetCWEngineDataResponse;
  available_images: BaseImage[];
};

export default function StartTestBatchPopup({
  open_state,
  set_open_state,
  courseworkId,
  refresh,
  cw_engine_data,
  available_images,
}: Props) {
  const image_name = available_images.find(
    (i) => i.id === cw_engine_data.base_image_id,
  );
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  if (!image_name) {
    // undefined image!!
  }
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const start_test_run = async () => {
    const repo_ids = Object.keys(rowSelection);
    setSubmitting(true);
    console.log(notificationsEnabled);
    try {
      const d = await send_test_run_start_req(
        courseworkId,
        repo_ids,
        notificationsEnabled,
      );
      toast.success(
        `${d.started} test runs started successfully; ${d.failed} runs failed to start.`,
      );
      refresh();
    } catch (_e) {
      toast.error("An error occurred when starting the test run.");
      refresh();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[80vh]! overflow-y-auto p-0 border-none bg-transparent shadow-none">
        <div className="flex min-w-0 flex-col gap-6 w-full justify-center items-stretch lg:flex-row">
          <div className="min-w-0 lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border shadow-lg justify-start flex flex-col">
            <div className="p-8">
              <DialogTitle className="text-xl">
                Select student(s) and group(s)
              </DialogTitle>
              <p className="text-sm text-muted-foreground mb-6">
                Please select the student(s) or group(s) whose repos you would
                like to include in this test run.
              </p>
              <CardTitle>Choose students</CardTitle>
              <div className={"flex min-w-0 items-center gap-2 w-full"}>
                <Suspense>
                  <StudentReposTable
                    coursework_id={courseworkId}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                  />
                </Suspense>
              </div>
            </div>
          </div>
          <div className=" h-full lg:max-h-[80vh]! lg:max-w-[30vw]! lg:overflow-y-auto bg-background border rounded-xl shadow-lg justify-between flex flex-col p-8">
            <div className="h-full flex flex-col gap-4">
              <div>
                <CardTitle className="text-xl">Confirm and submit</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Once you have checked over everything, start the test run
                  here.
                </p>
              </div>

              {!image_name && (
                <>
                  <Item className={"mb-2"} variant={"outline"}>
                    <ItemContent>
                      <ItemMedia variant={"icon"}>
                        <TriangleAlert />
                      </ItemMedia>
                      <ItemTitle>Error</ItemTitle>
                      <ItemDescription>
                        The base image that has been configured is missing.
                        Please update the testing configuration.
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </>
              )}
              {image_name && (
                <>
                  <div className="flex flex-col">
                    <ItemTitle className={"text-sm"}>
                      Current testing configuration
                    </ItemTitle>
                    <ItemDescription>
                      Image used to test selected students/groups.
                    </ItemDescription>
                  </div>
                  <Item className={"mb-2"} variant={"outline"}>
                    <ItemContent>
                      <ItemHeader>
                        <ItemMedia variant={"icon"}>
                          <Layers />
                        </ItemMedia>
                        <div className="flex flex-col">
                          <span className={"font-black"}>
                            {image_name.name}
                          </span>
                          <p>
                            Tester command:{" "}
                            <span className={"font-mono"}>
                              {cw_engine_data.tester_command}
                            </span>
                          </p>
                        </div>

                        <HoverCard openDelay={10} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <CircleQuestionMark
                              className={"text-muted-foreground"}
                            />
                          </HoverCardTrigger>
                          <HoverCardContent
                            className={"flex w-64 flex-col gap-0.5 text-sm"}
                          >
                            <div className={"font-medium"}>
                              Not what you expected?
                            </div>
                            <div>
                              You can change testing settings using the
                              'Configure engine' option in the coursework
                              dropdown menu.
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </ItemHeader>
                    </ItemContent>
                  </Item>
                  <FieldLabel htmlFor="switch-notifications">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Enable notifications</FieldTitle>
                        <FieldDescription>
                          If this option if enabled, we'll send you a
                          notification when this test run completes.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        onCheckedChange={(checked) =>
                          setNotificationsEnabled(checked)
                        }
                        id="switch-notifications"
                        defaultChecked
                      />
                    </Field>
                  </FieldLabel>
                </>
              )}
              <Button
                className={"w-full mt-auto"}
                disabled={!image_name || submitting}
                onClick={() => start_test_run()}
              >
                {submitting ? <Spinner /> : <Send />}
                Begin test run
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
