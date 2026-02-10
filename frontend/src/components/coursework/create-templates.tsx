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
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ZipUploadPage from "./upload-zip";  
import ActivateTemplateRepo from "./activate-templateRepo-button";
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
  const [notActivatedRepo, setNotActivatedRepo] = useState(true);


  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[80vh]! overflow-y-auto p-0 border-none bg-transparent shadow-none">
        <div className="flex flex-col-reverse lg:flex-row gap-6 w-full justify-center items-stretch">
          <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border rounded-xl shadow-lg justify-between flex flex-col">
            
            <div className="p-8 pb-0">
              <DialogTitle className="text-xl">
                Templates
              </DialogTitle>
              <p className="text-sm text-muted-foreground mb-6">
                Create, Edit and Provision coursework templates here
              </p>
            </div>

            <div className="overflow-y-auto px-8 space-y-6">

                <div className="space-y-3">
                  <div className="rounded-md border border-border p-4">
                    <DialogTitle className="font-medium text-sm">
                        Upload ZIP
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mb-2">
                        Upload templates for the coursework via ZIP here
                    </p>
                    <ZipUploadPage/>
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
                    <div className="flex items-center gap-4">
                        <ActivateTemplateRepo courseworkGitlabId={courseworkGitlabId} onActivated={() => setNotActivatedRepo(false)}/>

                        <Input
                            id={"form-flow-name"}
                            placeholder={"My amazing coursework"}
                            autoComplete={"off"}
                            disabled={notActivatedRepo}
                        />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pb-8">
                  <div className="flex justify-between items-end rounded-md border border-border p-4">
                    <div>
                      <DialogTitle className="font-medium text-sm">
                        File
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground mb-2">
                        File structure of each coursework repository
                      </p>
                    </div>
                  </div>
                </div>

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
