"use client";

import type { ColumnDef } from "@tanstack/table-core";
import { ClipboardCopy, MoreHorizontal, Trash } from "lucide-react";
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

export type BaseImage = {
  id: string;
  name: string;
  description: string;
  image_uri: string;
};

export const columns: ColumnDef<BaseImage>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const image = row.original;
      const router = useRouter();
      const [deleting, _setDeleting] = useState<boolean>(false);
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
                navigator.clipboard.writeText(image.image_uri);
                toast.success("Image URI copied to clipboard");
              }}
            >
              <ClipboardCopy />
              Copy image URI
            </DropdownMenuItem>
            <DropdownMenuItem
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
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "image_uri",
    header: "Image URI",
  },
];
