import {BaseImage, columns} from "@/components/base_image/columns";
import {BaseImageTable} from "@/components/base_image/base_image_table";
import {Suspense} from "react";
import {get_base_images} from "@/lib/actions/get_base_images";

async function getData(): Promise<BaseImage[]> {
  return (await get_base_images()).images
}

async function PageContents() {
  const data = await getData();
  return (
      <BaseImageTable columns={columns} data={data}/>

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

