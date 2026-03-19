"use client";

import {
  type Dispatch,
  type SetStateAction, Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { template_existance } from "@/lib/actions/template_existance";
import { template_file_tree } from "@/lib/actions/template_file_tree";
import { template_url } from "@/lib/actions/template_url";
import ActivateTemplateRepo from "./activate-templateRepo-button";
import RepoTree from "./file-tree";
import RepoAccessBox from "./repo-access-box";
import ZipUploadPage from "./upload-zip";
import {Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {CreateBIForm} from "@/app/base_image/create_form";
import {StudentReposTable} from "@/components/coursework/repos_table";
import {Button} from "@/components/ui/button";
import {CircleQuestionMark, Layers, Send, TriangleAlert} from "lucide-react";
import {GetCWEngineDataResponse} from "@/lib/actions/get_cw_engine_data";
import {Item, ItemContent, ItemDescription, ItemHeader, ItemMedia, ItemTitle} from "@/components/ui/item";
import {BaseImage} from "@/lib/actions/get_base_images_cw_specific";
import {Field, FieldContent, FieldDescription, FieldLabel, FieldTitle} from "@/components/ui/field";
import {Switch} from "@/components/ui/switch";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";


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

  const image_name = available_images.find((i) => i.id == cw_engine_data.base_image_id)
  if (!image_name) {
    // undefined image!!
  }

  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[80vh]! overflow-y-auto p-0 border-none bg-transparent shadow-none">
        <div className="flex flex-col lg:flex-row gap-6 w-full justify-center items-stretch">
          <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border shadow-lg justify-start flex flex-col">
            <div className="p-8">
              <DialogTitle className="text-xl">Select student(s) and group(s)</DialogTitle>
              <p className="text-sm text-muted-foreground mb-6">
                Please select the student(s) or group(s) whose repos you would like to include in this test run.
              </p>
              <Card>
                <CardContent className={""}>
                  <CardHeader className={"pl-0"}>
                    <CardTitle>Choose students</CardTitle>
                  </CardHeader>
                  <div className={"flex items-center gap-2 w-full"}>
                    <Suspense>
                      <StudentReposTable coursework_id={courseworkId}/>
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="lg:max-h-[50vh]! lg:max-w-[30vw]! lg:overflow-y-auto bg-background border rounded-xl shadow-lg justify-between flex flex-col">
                <Card className={"h-full w-full"}>
                  <CardHeader className={""}>
                    <CardTitle className="text-xl">Confirm and submit</CardTitle>
                  </CardHeader>
                  <CardContent>

                    <p className="text-sm text-muted-foreground mb-6">
                      Once you have checked over everything, start the test run here.
                    </p>
                    {(!image_name) && (
                        <>
                          <Item className={"mb-2"} variant={"outline"}>
                            <ItemContent>
                              <ItemMedia variant={"icon"}><TriangleAlert/></ItemMedia>
                              <ItemTitle>Error</ItemTitle>
                              <ItemDescription>The base image that has been configured is missing. Please update the testing configuration.</ItemDescription>
                            </ItemContent>
                          </Item>
                        </>
                    )}
                    {(image_name) && (
                        <>
                              <Item className={"mb-2"} variant={"outline"}>
                                <ItemContent>
                                  <ItemHeader>
                                    <ItemMedia variant={"icon"}><Layers/></ItemMedia>
                                    <ItemTitle className={"text-md"}>Current testing configuration</ItemTitle>
                                    <HoverCard openDelay={10} closeDelay={100}>
                                      <HoverCardTrigger asChild>
                                        <CircleQuestionMark className={"text-muted-foreground"}/>
                                      </HoverCardTrigger>
                                      <HoverCardContent className={"flex w-64 flex-col gap-0.5 text-sm"}>
                                        <div className={"font-medium"}>Not what you expected?</div>
                                        <div>You can change testing settings using the 'Configure engine' option in the coursework dropdown menu.</div>
                                      </HoverCardContent>
                                    </HoverCard>
                                  </ItemHeader>
                                  <div>
                                    <span className={"font-black"}>{image_name.name}</span>
                                    <p>Tester command: <span className={"font-mono"}>{cw_engine_data.tester_command}</span></p>
                                  </div>
                                </ItemContent>
                              </Item>
                          <FieldLabel htmlFor="switch-notifications">
                            <Field orientation="horizontal">
                              <FieldContent>
                                <FieldTitle>Enable notifications</FieldTitle>
                                <FieldDescription>
                                  If this option if enabled, you will be sent a notification when this test run completes. You can change your notifications preferences in Settings.
                                </FieldDescription>
                              </FieldContent>
                              <Switch id="switch-notifications" defaultChecked />
                            </Field>
                          </FieldLabel>
                        </>
                    )}
                  </CardContent>
                  <CardFooter className={"flex-col gap-2"}>
                    <Button className={"w-full"} disabled={(!image_name)}><Send/>Begin test run</Button>
                  </CardFooter>
          </Card>
              </div>

            </div>
      </DialogContent>
    </Dialog>
  );
}
