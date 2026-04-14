"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { activate_template_request } from "@/lib/actions/coursework/activate_template_project";

interface ActivateTemplateRepo {
  courseworkGitlabId: string;
  cw_id: string;
  status: number;
  setStatus: (status: number) => void;
  onRefresh: () => void;
}

export default function ActivateTemplateRepo({
  courseworkGitlabId,
  cw_id,
  status,
  setStatus,
  onRefresh,
}: ActivateTemplateRepo) {
  const [loadingState, setLoadingState] = useState<boolean>(false);

  const handleActivate = async () => {
    try {
      setLoadingState(true);
      setStatus(1);
      const result = await activate_template_request({
        cw_id: cw_id,
        courseworkGitLabId: courseworkGitlabId,
      });
      setLoadingState(false);
      if (result) {
        toast.success("Template Repository activated successfully");
        onRefresh();
      } else {
        throw new Error();
      }
    } catch (_error) {
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

      {status === 1 && !loadingState && (
        <Button size="lg" disabled className="w-full">
          <Spinner className="mr-2 h-4 w-4" />
        </Button>
      )}

      {loadingState && (
        <Button size="lg" disabled className="w-full">
          <Spinner className="mr-2 h-4 w-4" />
          Activating...
        </Button>
      )}

      {status === 2 && !loadingState && (
        <Button
          size="lg"
          variant="outline"
          className="w-full border-green-500 text-green-600 cursor-default"
          disabled
        >
          ✓ Template Repo Activated
        </Button>
      )}
    </div>
  );
}
