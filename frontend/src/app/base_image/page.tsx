import {BaseImage, columns} from "@/components/base_image/columns";
import {BaseImageTable} from "@/components/base_image/base_image_table";
import {Suspense} from "react";
import {get_base_images_admin} from "@/lib/actions/get_base_images_admin";
import {Button} from "@/components/ui/button";
import {LayersPlus} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import z from "zod";
import {CreateBIForm} from "@/app/base_image/create_form";

async function getData(): Promise<BaseImage[]> {
  return (await get_base_images_admin()).images
}

async function PageContents() {
  const data = await getData();

  return (
      <div className={"flex flex-col gap-2"}>
        <Dialog>
          <DialogTrigger asChild><Button variant={"outline"}><LayersPlus/> Register base image</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new base image</DialogTitle>
              <DialogDescription>You can register a new base image into the system here.</DialogDescription>
            </DialogHeader>
            <div className={"flex items-center gap-2 w-full"}>
              <Suspense>
                <CreateBIForm/>
              </Suspense>
            </div>
          </DialogContent>

        </Dialog>
        <BaseImageTable columns={columns} data={data}/>
      </div>
  )
}

export default async function BaseImageListPage() {

  return (
      <div className={"container mx-auto py-10"}>
        <Suspense>
          <PageContents/>
        </Suspense>
      </div>
  )
}

