"use client"

import {ColumnDef} from "@tanstack/table-core";

export type BaseImage = {
  id: string;
  name: string;
  description: string;
  image_uri: string;
}

export const columns: ColumnDef<BaseImage>[] = [
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
]