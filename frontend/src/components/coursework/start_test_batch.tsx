"use client";

import {
  type Dispatch,
  type SetStateAction, Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { template_existance } from "@/lib/actions/template_existance";
import { template_file_tree } from "@/lib/actions/template_file_tree";
import { template_url } from "@/lib/actions/template_url";
import ActivateTemplateRepo from "./activate-templateRepo-button";
import RepoTree from "./file-tree";
import RepoAccessBox from "./repo-access-box";
import ZipUploadPage from "./upload-zip";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CreateBIForm} from "@/app/base_image/create_form";
import {StudentReposTable} from "@/components/coursework/repos_table";


type Props = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  courseworkId: string;
  refresh: () => void;
};



export default function StartTestBatchPopup({
  open_state,
  set_open_state,
  courseworkId,
  refresh,
}: Props) {

  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[80vh]! overflow-y-auto p-0 border-none bg-transparent shadow-none">
        <div className="flex flex-col lg:flex-row gap-6 w-full justify-center items-stretch">
          <div className="lg:max-h-[40vh]! flex-2 lg:overflow-y-auto bg-background border shadow-lg justify-start flex flex-col">
            <div className="p-8">
              <DialogTitle className="text-xl">Start test batch</DialogTitle>
              <p className="text-sm text-muted-foreground mb-6">
                You can start a new batch test run here.
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
          <div className="lg:max-h-[40vh]! flex-2 lg:overflow-y-auto bg-background border rounded-xl shadow-lg justify-between flex flex-col">
            <div className="space-y-3">
              <div className="p-8 pb-0">
                <DialogTitle className="text-xl">Confirm and submission</DialogTitle>
                <p className="text-sm text-muted-foreground mb-6">
                  Submit the batch test run.
                </p>
              </div>
              <div className="p-8 pt-0">

              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
