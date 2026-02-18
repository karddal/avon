"use client";

import {
  BookCheck,
  BookDashed,
  Container,
  Menu,
  ServerCog,
  SquarePen,
  SquareX,
} from "lucide-react";
import { useState } from "react";
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
import CreateTemplate from "./create-templates";
import { useRouter } from "next/navigation";


type CourseworkUpdateData = {
  id: string;
  name: string;
  description?: string;
  unit_id: string;
  due_date: string;
  creation_date: string;
  colour: string;
  unit_name: string;
  unit_code: string;
  max_end_date: Date;
  gitlabId: string;
};

export default function CourseworkLectDropdown({
  slug,
  _me,
  coursework_update_data,
}: {
  slug: string;
  _me: string;
  coursework_update_data: CourseworkUpdateData;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDocker, setShowDocker] = useState(false);
  const [showTemplates, setShowTemplate] = useState(false);
  const router = useRouter();

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

          <DropdownMenuItem
            disabled={false}
            onSelect={() => setShowTemplate(true)}
          >
            <BookDashed className="mr-2 h-4 w-4" />
            Templates
          </DropdownMenuItem>

          <DropdownMenuItem disabled={true}>
            <ServerCog className="mr-2 h-4 w-4" />
            Engine
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={false}
            onSelect={() => setShowDocker(true)}
          >
            <Container className="mr-2 h-4 w-4" />
            Create Dockerfile
          </DropdownMenuItem>

          <DropdownMenuItem disabled={true}>
            <BookCheck className="mr-2 h-4 w-4" />
            Results
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setShowEdit(true)}>
            <SquarePen className="mr-2 h-4 w-4" />
            Edit coursework
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setShowDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <SquareX className="text-destructive mr-2 h-4 w-4" /> Delete
            coursework
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTemplate
        open_state={showTemplates}
        set_open_state={setShowTemplate}
        courseworkGitlabId={coursework_update_data.gitlabId}
        courseworkId={coursework_update_data.id}
        refresh={() => router.refresh()}
      />

      <CreateDockerfile
        open_state={showDocker}
        set_open_state={setShowDocker}
        refresh={() => router.refresh()}
      ></CreateDockerfile>

      <EditCoursework
        coursework_update_data={coursework_update_data}
        open_state={showEdit}
        set_open_state={setShowEdit}
      />

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
}
