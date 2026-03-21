"use client";

import type { ColumnDef } from "@tanstack/table-core";
import {Ban, Check, ClipboardCopy, Cross, Eye, EyeClosed, MoreHorizontal, Trash} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { delete_base_image } from "@/lib/actions/delete_base_image";
import {set_base_image_status} from "@/lib/actions/set_base_image_status";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";

export type BaseImage = {
  id: string;
  name: string;
  description: string;
  task_description_name: string;
  is_active: boolean;
};

export const columns: (router: AppRouterInstance) => ColumnDef<BaseImage>[] = (router) => {return [
  {
    id: "actions",
    cell: ({ row }) => {
      const image = row.original;
      const router = useRouter();
      const [deleting, _setDeleting] = useState<boolean>(false);

      const setActiveState: (target_is_active_state: boolean) => Promise<void> = async (target_is_active_state) =>{

        try {
          await set_base_image_status(image.id, target_is_active_state);
          if (target_is_active_state === true) {
            toast.success("Activated base image.");
          } else {
            toast.success("Deactivated base image.");
          }
          router.refresh();
        } catch (e) {
          toast.error("Could not update base image status.");
          router.refresh();
        }

      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} className={"h-8 w-8 p-0"}>
              <span className={"sr-only"}>Open menu</span>
              <MoreHorizontal className={"h-4 w-4"}></MoreHorizontal>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(image.task_description_name);
                toast.success("Task description name copied to clipboard");
              }}
            >
              <ClipboardCopy />
              Copy image URI
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveState(!row.original.is_active)}>
              {row.original.is_active && (
                  <><Ban/> Set inactive </>
              )}
              {!row.original.is_active && (
                  <><Check/> Set active</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem variant={"destructive"}
              onClick={() => {
                const deleteRequest = { id: image.id };
                delete_base_image(deleteRequest).then((res) => {
                  if (!res.success) {
                    toast.error("Failed to delete the image.");
                  } else {
                    toast.success("Successfully deleted.");
                    router.refresh();
                  }
                });
              }}
            >
              {!deleting && <Trash />}
              {deleting && <Spinner />}
              Delete image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Active",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "task_description_name",
    header: "AWS task description name",
  },
]}
