"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { provision_individual_projects } from "@/lib/actions/provision_individual_projects";
import { Spinner } from "../ui/spinner";
import {Item, ItemActions, ItemContent, ItemDescription, ItemHeader, ItemMedia, ItemTitle} from "@/components/ui/item";
import {Component, UserIcon, Users} from "lucide-react";
import StudsListDialog from "@/components/coursework/student-list/studs-table-dialog";
import StudsListDialogForProvision from "@/components/coursework/stud_list_for_provisioning/studs-table-dialog";

type GitlabData = {
  name: string;
  coursework_id: string;
  template_id: string;
};

type DockerProps = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  gitlab_data: GitlabData;
  refresh: () => void;
};

export default function ProvisionCoursework({
  open_state,
  set_open_state,
  gitlab_data,
    refresh,
}: DockerProps) {
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [status, setStatus] = useState<number>(0);
  const [showStudsList, setShowStudsList] = useState<boolean>(false);

  const provisionForIndividuals = async (gitlab_data: GitlabData) => {
    const req = {
      name: gitlab_data.name,
      coursework_id: gitlab_data.coursework_id,
      template_id: gitlab_data.template_id,
    };
    try {
      setLoadingState(true);
      setStatus(1);
      const result = await provision_individual_projects(req);
      setLoadingState(false);
      if (result.success) {
        setStatus(2);
        toast.success("Projects successfully provisioned");
      } else {
        toast.error("Failed to provision projects. Are there already some repos provisioned for students?");
        setStatus(0);
      }
    } catch (_error) {
      toast.error("Failed to provision");
      setStatus(0);
    }
  };

  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent className="max-w-[90%]! xl:max-w-[60%]! w-full max-h-full! lg:max-h-[70vh]! overflow-y-auto p-0">
        <div className="flex flex-col gap-6 w-full justify-center items-stretch">
          <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border rounded-xl justify-between flex flex-col">
            <div className="p-8 pb-0">
              <DialogTitle className="text-xl">
                Provision repos
              </DialogTitle>
              <p className="text-sm text-muted-foreground mb-6">
                There are multiple ways to provision coursework repos. Please read through them and decide which one you would like to use.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row mx-10 gap-8 justify-between mb-10">
            <div className="flex flex-col flex-1 gap-2">
              <Item variant={"outline"}>
                <ItemHeader>
                  <ItemMedia variant={"icon"}><Users/></ItemMedia>
                  <ItemTitle>Batch provision for individuals</ItemTitle>
                </ItemHeader>
                <ItemContent>
                  <ItemDescription>
                    Provision one repo for every student on the unit.
                  </ItemDescription>
                </ItemContent>
                <ItemActions className={"w-full"}>
                    {status === 0 && !loadingState && (
                        <Button
                            onClick={() => provisionForIndividuals(gitlab_data)}
                            variant="outline"
                            className="w-full mt-4"
                        >
                          Provision for all students
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

                    {status === 2 && !loadingState && (
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full border-green-500 text-green-600 cursor-default"
                            disabled
                        >
                          ✓ All projects provisioned
                        </Button>
                    )}
                </ItemActions>
              </Item>
            </div>

            <div className="md:w-px md:h-auto h-px w-full bg-border self-stretch" />

            <div className="flex flex-col flex-1 gap-2">
              <Item variant={"outline"}>
                <ItemHeader>
                  <ItemMedia variant={"icon"}><UserIcon/></ItemMedia>
                  <ItemTitle>Selective provisioning</ItemTitle>
                </ItemHeader>
                <ItemContent>
                  <ItemDescription>
                    Select individual students and provision repos for them.
                  </ItemDescription>
                </ItemContent>
                <ItemActions className={"w-full"}>
                      <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => setShowStudsList(true)}
                      >
                        Start selecting students
                      </Button>
                </ItemActions>
              </Item>
            </div>

            <StudsListDialogForProvision open_state={showStudsList} set_open_state={setShowStudsList} courseworkId={gitlab_data.coursework_id} refresh={refresh} gitlabData={gitlab_data}/>

            <div className="md:w-px md:h-auto h-px w-full bg-border self-stretch" />

            <div className="flex flex-col flex-1 gap-2">
              <Item variant={"muted"}>
                <ItemHeader>
                  <ItemMedia variant={"icon"}><Component/></ItemMedia>
                  <ItemTitle>Group provisioning</ItemTitle>
                </ItemHeader>
                <ItemContent>
                  <ItemDescription>
                    Specify student groups using a CSV and provision repos accordingly.
                  </ItemDescription>
                </ItemContent>
                <ItemActions className={"w-full"}>
                  {status === 0 && !loadingState && (
                      <Button
                          onClick={() => provisionForIndividuals(gitlab_data)}
                          disabled
                          variant={"ghost"}
                          className="w-full mt-4"
                      >
                        Coming soon...
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

                  {status === 2 && !loadingState && (
                      <Button
                          size="lg"
                          variant="outline"
                          className="w-full border-green-500 text-green-600 cursor-default"
                          disabled
                      >
                        ✓ All projects provisioned
                      </Button>
                  )}
                </ItemActions>
              </Item>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
