"use client";

import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileCheck,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ZipUploadPage from "./upload-zip";  
import ActivateTemplateRepo from "./activate-templateRepo-button";
import RepoAccessBox from "./repo-access-box"
import RepoTree from "./file-tree"
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IMAGES } from "@/lib/docker/image";
import { TOOLS } from "@/lib/docker/tools";
import type { Image, Tool } from "@/lib/docker/types";
import { cn } from "@/lib/utils";

// Need to check if anotehr repo is already intialised, if it is then activate repo button has to be green already
// If this template repo contains stuff already, the upload zip part (WHICH NEEDS A LOADING BAR AND BUTTON FOR SUBMITTTING), must turn it's submit button into an overwrite button, and state that an overwrite will happen (alert / warning menu)
// Maybe have a timeline for setting up coursework, CRUD -> Templates -> Tests -> TestingTests -> Provisioning and permissions

type Props = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  courseworkGitlabId: string;
};

export default function CreateTemplate({
  open_state,
  set_open_state,
  courseworkGitlabId
}: Props) {
  const [gitlabRepoUrl, setGitlabRepoUrl] = useState<string | null>(null)
  const [activateStatus, setActiveStatus] = useState<number>(0);

  useEffect(() => {
    // result = call to check wether there is an exsitiong tenmplate in that coursework group
    setActiveStatus(2) // If there is then set to 2, and otherwise to 0
  }, [])



  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[80vh]! overflow-y-auto p-0 border-none bg-transparent shadow-none">
        <div className="flex flex-col lg:flex-row gap-6 w-full justify-center items-stretch">
            <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border shadow-lg justify-start flex flex-col">
              <div className="p-8 pb-0">
                <DialogTitle className="text-xl">
                  Templates
                </DialogTitle>
                <p className="text-sm text-muted-foreground mb-6">
                  Create and Edit coursework templates here
                </p>
              </div>

              <div className="overflow-y-auto p-8 pt-0 flex flex-col gap-2">

                  <div className="space-y-3">
                    <div className="rounded-md border border-border p-4">
                      <DialogTitle className="font-medium text-sm">
                          Upload ZIP
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground mb-2">
                          Upload templates for the coursework via ZIP here
                      </p>
                      <ZipUploadPage uploadSetStatus={setActiveStatus}  uploadStatus={activateStatus}/>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-md border border-border p-4">
                      <DialogTitle className="font-medium text-sm">
                          Push to GitLab
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground mb-2">
                          Push templates for the coursework straight to GitLab
                      </p>
                      <div className="flex flex-col-reverse w-full items-center gap-2">
                            <ActivateTemplateRepo
                                  courseworkGitlabId={courseworkGitlabId}
                                  status={activateStatus}
                                  setStatus={setActiveStatus}
                                  setGitlabUrl={setGitlabRepoUrl}
                              />
                          {activateStatus === 2 && (
                              <RepoAccessBox repoUrl={gitlabRepoUrl} />
                          )}
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border rounded-xl shadow-lg justify-between flex flex-col">      
                <div className="space-y-3">
                    <div className="p-8 pb-0">
                      <DialogTitle className="text-xl">
                        Files
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground mb-6">
                          File structure of Template repository
                      </p>
                    </div>
                    <div className="p-8 pt-0">
                          {activateStatus !== 2 && (
                            <div className="h-64 rounded-md bg-gray-100 flex items-center justify-center">
                              <p className="text-sm text-gray-400">
                                Repository preview unavailable until activation
                              </p>
                            </div>
                          )}

                          {activateStatus === 2 &&(
                            <RepoTree repoId={"should be id of template repo"}/>
                          )}
                    </div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
