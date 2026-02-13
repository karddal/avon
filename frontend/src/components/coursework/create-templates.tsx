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
import { template_existance } from "@/lib/actions/template_existance";

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
import { template_file_tree } from "@/lib/actions/template_file_tree";
import { template_url } from "@/lib/actions/template_url";


// Query db to see if template id is none (just see in db) on every page load: 
// (tho could do all thsi without db just kinda long icl, actualy just need to change how we get the coursework url stuff, with file structure ofc)
// (would need refresh in that case for when uttons get activated, myabe whenever activateStatus == 2)
// - If so then need to activate/create then store in db, (id of template);
// - If not then get data using id for urls and files (maybe need to trigger when state is changed on creation / activation, to start the button changes), do in one so loads up at once and UI sinks, overwrite button shoudl swicth between request types in the button


// If this template repo contains stuff already, the upload zip part (WHICH NEEDS A LOADING BAR AND BUTTON FOR SUBMITTTING), must turn it's submit button into an overwrite button, and state that an overwrite will happen (alert / warning menu)
// Maybe have a timeline for setting up coursework, CRUD -> Templates -> Tests -> TestingTests -> Provisioning and permissions


// Maybe tabs for different links to repo, like ssh and https
type Props = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  courseworkGitlabId: string;
};

type GitLabTreeItem = {
  id: string;
  name: string;
  type: "blob" | "tree";
  path: string;
  mode: string;
};

export default function CreateTemplate({
  open_state,
  set_open_state,
  courseworkGitlabId
}: Props) {
  const [activateStatus, setActiveStatus] = useState<number>(0)
  const [templatehttpURL, setTemplatehttpURL] = useState<string | null>(null)
  const [templateSshURL, setTemplateSshURL] = useState<string | null>(null)
  const [templateId, setTemplateId] = useState<number | null>(null)
  const [fileTree, setFileTree] = useState<GitLabTreeItem[]>([])
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (!open_state) return;

    const loadAll = async () => {
      const response = await template_existance({
        courseworkGitLabId: courseworkGitlabId,
      });

      if (!response.exists || !response.templateProjectId) {
        setTemplateId(null);
        setActiveStatus(0);
        setFileTree([]);
        setTemplatehttpURL(null);
        setTemplateSshURL(null);
        return;
      }

      const id = response.templateProjectId;

      setTemplateId(id);
      setActiveStatus(2);

      const templateData = await template_file_tree({
        templateProjectId: String(id),
      });

      setFileTree(templateData);

      const urlResponse = await template_url({
        templateProjectId: String(id),
      });

      setTemplatehttpURL(urlResponse.http);
      setTemplateSshURL(urlResponse.ssh);
    };

    loadAll();
  }, [courseworkGitlabId, refreshKey, open_state]);


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
                      <ZipUploadPage uploadSetStatus={setActiveStatus}  uploadStatus={activateStatus}/> {/*Have to update satte in here now if intialise and upload in one using this button / area brev*/}
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
                                  onRefresh={triggerRefresh}
                              />
                          {activateStatus === 2 && (
                              <RepoAccessBox repoUrl={templatehttpURL} />
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
                            <RepoTree fileTree={fileTree}/> //repoId={templateId} 
                          )}
                    </div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
