"use client";

import { CircleQuestionMark, Layers, Send, TriangleAlert } from "lucide-react";
import { type Dispatch, type SetStateAction, Suspense } from "react";
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
import { Switch } from "@/components/ui/switch";
import type { BaseImage } from "@/lib/actions/get_base_images_cw_specific";
import type { GetCWEngineDataResponse } from "@/lib/actions/get_cw_engine_data";
import StudsListDialog from "@/components/coursework/student-list/studs-table-dialog";

type Props = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  courseworkId: string;
  refresh: () => void;
};

export default function ReposListDialog({
                                              open_state,
                                              set_open_state,
                                              courseworkId,
    refresh,
                                            }: Props) {

  return (
      <Dialog open={open_state} onOpenChange={set_open_state}>
        <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[80vh]! overflow-y-auto p-0 border-none bg-transparent shadow-none">
          <div className="flex min-w-0 flex-col gap-6 w-full justify-center items-stretch lg:flex-row">
            <div className="min-w-0 lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border shadow-lg justify-start flex flex-col">
              <div className="p-8">
                <DialogTitle className="text-xl">
                  View student repos
                </DialogTitle>
                <p className="text-sm text-muted-foreground mb-6">
                  This table lists all student repos that have been provisioned for this coursework.
                </p>
                <CardTitle>Repos</CardTitle>
                <div className={"flex min-w-0 items-center gap-2 w-full"}>
                  <Suspense>
                    <StudsListDialog refresh={refresh} open_state={open_state} set_open_state={set_open_state} courseworkId={courseworkId} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}
