"use client";

import type { RowSelectionState } from "@tanstack/table-core";
import { Send } from "lucide-react";
import { type Dispatch, type SetStateAction, Suspense, useState } from "react";
import { toast } from "sonner";
import { StudentsTableWithMaybeRepos } from "@/components/coursework/stud_list_for_provisioning/studs-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { provision_individual_projects_for_specific } from "@/lib/actions/coursework/provision_for_specific_student";

type GitlabData = {
  name: string;
  coursework_id: string;
  template_id: string;
};

type Props = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  courseworkId: string;
  refresh: () => void;
  gitlabData: GitlabData;
};

export default function StudsListDialogForProvision({
  open_state,
  set_open_state,
  courseworkId,
  gitlabData,
  refresh,
}: Props) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [status, setStatus] = useState<number>(0);
  const [refreshTable, setRefreshTable] = useState<number>(0);

  const provisionForIndividuals = async (gitlab_data: GitlabData) => {
    const req = {
      name: gitlab_data.name,
      coursework_id: gitlab_data.coursework_id,
      template_id: gitlab_data.template_id,
      student_ids: Object.keys(rowSelection),
    };
    setLoadingState(true);
    setStatus(1);
    const result = await provision_individual_projects_for_specific(req);
    setLoadingState(false);
    if (result.success) {
      toast.success("Projects successfully provisioned");
      setRefreshTable(refreshTable + 1);
      setStatus(0);
      refresh();
    } else {
      toast.error(
        "Failed to provision projects. Are there already some repos provisioned for students?",
      );
      setStatus(0);
      setRefreshTable(refreshTable + 1);
    }
  };

  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[80vh]! overflow-y-auto p-0 border-none bg-transparent shadow-none">
        <div className="flex min-w-0 flex-col gap-6 w-full justify-center items-stretch lg:flex-row">
          <div className="min-w-0 lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border shadow-lg justify-start flex flex-col">
            <Card>
              <CardHeader>
                <DialogTitle asChild>
                  <CardTitle className="text-xl">
                    Provision repos for students
                  </CardTitle>
                </DialogTitle>
                <CardDescription>
                  This table lists all students on this coursework that have no
                  repo provisioned.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={"flex min-w-0 items-center gap-2 w-full"}>
                  <Suspense>
                    <StudentsTableWithMaybeRepos
                      coursework_id={courseworkId}
                      setRowSelection={setRowSelection}
                      rowSelection={rowSelection}
                    />
                  </Suspense>
                </div>
              </CardContent>
              <CardFooter>
                {status === 0 && !loadingState && (
                  <Button
                    onClick={() => provisionForIndividuals(gitlabData)}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <Send></Send> Provision repositories
                  </Button>
                )}

                {status === 1 && !loadingState && (
                  <Button className="w-full mt-4">
                    <Spinner className="mr-2 h-4 w-4" />
                  </Button>
                )}

                {loadingState && (
                  <Button disabled className="w-full mt-4">
                    <Spinner className="mr-2 h-4 w-4" />
                    Provisioning...
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
