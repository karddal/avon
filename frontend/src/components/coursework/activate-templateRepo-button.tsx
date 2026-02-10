"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { activate_template_repo } from "@/lib/actions/activate_template_repo";

interface ActivateTemplateRepo {
    courseworkGitlabId: string;
    onActivated: (gitlabRepoUrl: string) => void;
}

export default function ActivateTemplateRepo({courseworkGitlabId, onActivated} : ActivateTemplateRepo) {
  const [status, setStatus] = useState<number>(0);


  const handleActivate = async () => {
    try {
      setStatus(1);

      const result = await activate_template_repo({courseworkGitlabId});

      if (result) {
        toast.success("Template Repository activated successfully");
        setStatus(2);
        onActivated("testyyyyyyy");
      } else {
        throw new Error();
      }
    } catch (error) {
      setStatus(2);
      toast.error("Template Repository failed to Acivate");

      setTimeout(() => setStatus(0), 3000);
    }
  };

  return (
    <div className="h-full">
      {status === 0 && (
        <Button size="lg" className="w-full" onClick={handleActivate}>
          Activate Template Repo
        </Button>
      )}

      {status === 1 && (
        <Button size="lg" disabled className="w-full">
          <Spinner className="mr-2 h-4 w-4" />
          Activating...
        </Button>
      )}

      {status === 2 &&(
        <Button size="lg" variant="outline" className="w-full border-green-500 text-green-600 cursor-default" disabled>
            ✓ Template Repo Activated
        </Button>
      )}
    </div>
  );
}