"use client";

import {
  BookCheck,
  BookDashed,
  Container,
  LayersPlus,
  Menu,
  ServerCog,
  SquarePen,
  SquareX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import CreateDockerfile from "@/components/coursework/create-dockerfile";
import DeleteCourseworkButton from "@/components/coursework/delete_coursework_button";
import EditCoursework from "@/components/coursework/edit-coursework";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CourseworkUpdateData } from "@/lib/actions/get_coursework_update_data";
import CreateTemplate from "./create-templates";
import ProvisionCoursework from "./provision-coursework";

type GitlabData = {
  name: string;
  coursework_id: string;
  template_id: string;
};

export default function CourseworkLectDropdown({
  slug,
  scopes,
  coursework_update_data,
}: {
  slug: string;
  scopes: Set<string>;
  coursework_update_data?: CourseworkUpdateData;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDocker, setShowDocker] = useState(false);
  const [showTemplates, setShowTemplate] = useState(false);
  const router = useRouter();
  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);
  const [showProvision, setShowProvision] = useState(false);

  const entries = [];

  if (scopes.has("unit:coursework_engine")) {
    entries.push(
      <DropdownMenuItem key={"Engine"} disabled={true}>
        <ServerCog className="mr-2 h-4 w-4" />
        Engine
      </DropdownMenuItem>,
    );

    entries.push(
      <DropdownMenuItem
        key={"Dockerfiles"}
        disabled={false}
        onSelect={() => setShowDocker(true)}
      >
        <Container className="mr-2 h-4 w-4" />
        Create Dockerfile
      </DropdownMenuItem>,
    );
  }

  if (scopes.has("unit:coursework_manage")) {
    entries.push(
      <DropdownMenuItem key={"Results"} disabled={true}>
        <BookCheck className="mr-2 h-4 w-4" />
        Results
      </DropdownMenuItem>,
    );
    entries.push(
      <DropdownMenuItem key={"Edit"} onSelect={() => setShowEdit(true)}>
        <SquarePen className="mr-2 h-4 w-4" />
        Edit coursework
      </DropdownMenuItem>,
    );
    entries.push(
      <DropdownMenuItem disabled={false} onSelect={() => setShowTemplate(true)}>
        <BookDashed className="mr-2 h-4 w-4" />
        Templates
      </DropdownMenuItem>,
    );
    if (coursework_update_data) {
      entries.push(
        <CreateTemplate
          open_state={showTemplates}
          set_open_state={setShowTemplate}
          courseworkGitlabId={coursework_update_data.gitlabId}
          courseworkId={coursework_update_data.id}
          refresh={refresh}
        />,
      );
      entries.push(
        <EditCoursework
          coursework_update_data={coursework_update_data}
          open_state={showEdit}
          set_open_state={setShowEdit}
        />,
      );
    }

    entries.push(
      <DropdownMenuItem
        disabled={false}
        onSelect={() => setShowProvision(true)}
      >
        <LayersPlus className="mr-2 h-4 w-4" />
        Provision Coursework
      </DropdownMenuItem>,
    );
  }

  if (scopes.has("unit:coursework_delete")) {
    entries.push(
      <DropdownMenuSeparator key={"separator0"} />,
    );
    entries.push(
      <DropdownMenuItem
        key={"Delete"}
        onSelect={() => setShowDelete(true)}
        className="text-destructive focus:text-destructive"
      >
        <SquareX className="text-destructive mr-2 h-4 w-4" /> Delete coursework
      </DropdownMenuItem>,
    );
  }
  if (entries.length > 0) {
    return (
      <div className="aspect-square">
        <DropdownMenu>
          <DropdownMenuTrigger
            data-cy="coursework-lect-dropdown"
            className="border hover:bg-accent hover:transition p-2"
          >
            <Menu size={32} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col">
            <DropdownMenuLabel>Coursework Options</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {entries}
          </DropdownMenuContent>
        </DropdownMenu>

        <CreateDockerfile
          open_state={showDocker}
          set_open_state={setShowDocker}
        ></CreateDockerfile>

        {coursework_update_data && (
          <EditCoursework
            coursework_update_data={coursework_update_data}
            open_state={showEdit}
            set_open_state={setShowEdit}
          />
        )}
        {coursework_update_data && (
          <ProvisionCoursework
            open_state={showProvision}
            set_open_state={setShowProvision}
            gitlab_data={{
              name: coursework_update_data.name,
              coursework_id: coursework_update_data.id,
              template_id: String(coursework_update_data.templateId),
            }}
          ></ProvisionCoursework>
        )}
        <CreateDockerfile
          open_state={showDocker}
          set_open_state={setShowDocker}
          refresh={() => refresh()}
        ></CreateDockerfile>

        <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                coursework and all of its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
              <DeleteCourseworkButton courseworkId={slug} />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  } else {
    return <></>;
  }
}
