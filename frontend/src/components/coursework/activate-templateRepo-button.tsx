"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { activate_template_request } from "@/lib/actions/activate_template_project";

interface ActivateTemplateRepo {
    courseworkGitlabId: string;
    status: number;
    onRefresh: () => void;
}

export default function ActivateTemplateRepo({courseworkGitlabId, status, onRefresh} : ActivateTemplateRepo) {
  const [loadingState, setLoadingState] = useState<boolean>(false);
  
  const handleActivate = async () => {
    try {
      setLoadingState(true);
      const result = await activate_template_request({courseworkGitLabId: courseworkGitlabId});
      setLoadingState(false);
      if (result) {
        toast.success("Template Repository activated successfully");
        onRefresh();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Template Repository failed to Acivate");
    }
  };

  return (
    <div className="h-full w-full">
      {status === 0 && !loadingState && (
        <Button size="lg" className="w-full" onClick={handleActivate}>
          Activate Template Repo
        </Button>
      )}

      {loadingState && (
        <Button size="lg" disabled className="w-full">
          <Spinner className="mr-2 h-4 w-4" />
          Activating...
        </Button>
      )}

      {status === 2 && !loadingState &&(
        <Button size="lg" variant="outline" className="w-full border-green-500 text-green-600 cursor-default" disabled>
            ✓ Template Repo Activated
        </Button>
      )}
    </div>
  );
}