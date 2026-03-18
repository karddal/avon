"use client";

import {
  Check,
  ChevronDown,
  ChevronRight, Container,
  Copy,
  Download,
  FileCheck, Layers,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {type Dispatch, type SetStateAction, useEffect, useMemo, useState} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IMAGES } from "@/lib/docker/image";
import { cn } from "@/lib/utils";
import {Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList} from "../ui/combobox";
import {Item, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@/components/ui/item";
import {Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle} from "@/components/ui/field";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {get_base_images_cw_specific} from "@/lib/actions/get_base_images_cw_specific";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {GetCWEngineDataResponse} from "@/lib/actions/get_cw_engine_data";
import {update_coursework_engine} from "@/lib/actions/update_coursework_engine";
import {Spinner} from "@/components/ui/spinner";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";

interface DockerConfig {
  baseImage: BaseImage;
  finalCommands: string;
}

interface Tool {
  name: string;
  version: string;
}

interface BaseImage {
  id: string;
  name: string;
  description: string;
  image_uri: string;
}

type DockerProps = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  refresh: () => void;
  available_images: BaseImage[];
  cw_engine_data: GetCWEngineDataResponse;
};

export default function ConfigureCWTesting({
  open_state,
  set_open_state,
  refresh,
    available_images,
    cw_engine_data,
}: DockerProps) {
  const [submitState, setSubmitState] = useState<boolean>(false);
  let img = available_images.find((i) => i.id == cw_engine_data.base_image_id)
  if (!img) {
      img = available_images[0]
  }
  const [config, setConfig] = useState<DockerConfig>({
    baseImage: img,
    finalCommands: cw_engine_data.tester_command ? cw_engine_data.tester_command : "",
  });


  const setBaseImage = (id: string) => {
    let baseImage = available_images.find((i) => i.id == id);
    if (!baseImage) {
      baseImage = available_images[0]
    }
    setConfig({...config, baseImage: baseImage});
  }

  const updateFinalCommand = (command: string) => {
    setConfig({ ...config, finalCommands: command });
  };

  const applyDockerfile = () => {
    setSubmitState(true);
    update_coursework_engine(cw_engine_data.cw_id, {base_image_id: config.baseImage.id, tester_command: config.finalCommands}).then((res) => {
      if (res.success) {
        toast.success("Successfully saved engine configuration.")
        setSubmitState(false);
        refresh();
      } else {
        toast.error("Failed to save engine configuration.")
        setSubmitState(false);
      }
    })
  };

  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[80vh]! overflow-y-auto p-0 border-none bg-transparent shadow-none">
        <div className="flex flex-col-reverse lg:flex-row gap-6 w-full justify-center items-stretch">
          <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border rounded-xl shadow-lg justify-between flex flex-col">
            <div className="p-8 pb-0">
              <DialogTitle className="text-xl flex flex-row gap-2">
                <Container/> Configure Testing Environment
              </DialogTitle>
              <p className="text-sm text-muted-foreground mb-6">
                You can set up the testing environment for your coursework here.
              </p>
            </div>
            <div className="overflow-y-auto px-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-left">
                    <DialogTitle className="font-medium text-sm">
                      Base Image
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mb-2">
                      The image used to create the testing environment.
                    </p>
                  </div>
                  <div className={"flex flex-col gap-1"}>
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Currently selected
                        </CardTitle>
                        <CardContent>
                          <Item variant={"outline"}>
                            <ItemContent>
                              <ItemTitle>{config.baseImage?.name}</ItemTitle>
                              <ItemDescription>
                                {config.baseImage?.description}
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        </CardContent>
                      </CardHeader>
                    </Card>
                  </div>
                  <Dialog>
                    <form>
                      <DialogTrigger asChild>
                        <Button variant="outline">Open base image gallery</Button>
                      </DialogTrigger>
                      <DialogContent className="w-full overflow-y-scroll max-h-[70%]">
                        <DialogHeader>
                          <DialogTitle>Base image gallery</DialogTitle>
                          <DialogDescription>
                            Select one of the available base images.
                          </DialogDescription>
                        </DialogHeader>
                        {available_images.length > 0 && (
                            <RadioGroup onValueChange={(x) => setBaseImage(x)} defaultValue={config.baseImage.id} className={"w-full overflow-y-scroll!"}>
                              {available_images.map((image) => (
                                  <FieldLabel key={image.id} htmlFor={image.id}>
                                    <Field orientation="horizontal">
                                      <FieldContent>
                                        <FieldTitle>{image.name}</FieldTitle>
                                        <FieldDescription>
                                          {image.description}
                                        </FieldDescription>
                                      </FieldContent>
                                      <RadioGroupItem value={image.id} id={image.id} />
                                    </Field>
                                  </FieldLabel>
                              ))}
                            </RadioGroup>
                        )}
                        {
                          available_images.length == 0 && (
                              <Empty className={"border border-dashed"}>
                                <EmptyHeader>
                                  <EmptyMedia variant={"icon"}><Layers/></EmptyMedia>
                                  <EmptyTitle>No base images available.</EmptyTitle>
                                  <EmptyDescription>We're sorry, but there are no base images available. Please, check back later.</EmptyDescription>
                                </EmptyHeader>
                              </Empty>
                            )
                        }

                      </DialogContent>
                    </form>
                  </Dialog>
                </div>
                <div className="space-y-3 pb-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <DialogTitle className="font-medium text-sm">
                        Final Command Chain
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground mb-2">
                        This command will be <strong>executed</strong> in the
                        coursework folder.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto bg-accent p-4 border rounded-md">
                      <div className="flex gap-2">
                        <Input
                          defaultValue={config.finalCommands}
                          onChange={(e) =>
                            updateFinalCommand(e.target.value)
                          }
                          placeholder="e.g. ./setup.sh"
                          className="font-mono text-sm"
                        />
                      </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2 p-8 border-t bg-background">
              {(!submitState) && (
                  <Button variant="default" className="w-full" onClick={() => applyDockerfile()}>
                    <FileCheck
                        className="mr-2 w-4 h-4"
                    />{" "}
                    Save
                  </Button>
              )}
              {(submitState) && (
                  <Button variant="ghost" disabled className="w-full">
                    <Spinner/>
                    Save
                  </Button>
              )}

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
