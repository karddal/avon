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
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
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

interface DockerConfig {
  baseImage: BaseImage;
  finalCommands: { id: string; value: string }[];
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
  refresh?: () => void;
  available_images: BaseImage[];
};

export default function ConfigureCWTesting({
  open_state,
  set_open_state,
  refresh,
    available_images,
}: DockerProps) {
  const [config, setConfig] = useState<DockerConfig>({
    baseImage: available_images[0],
    finalCommands: [],
  });

  const dockerfileContent = useMemo(() => {
    const sections = [];

    const chainedCmd = config.finalCommands
      .filter((c) => c.value.trim() !== "")
      .map((c) => c.value)
      .join(" && ");

    if (chainedCmd) {
      sections.push(`CMD ["sh", "-c", ${JSON.stringify(chainedCmd)}]`);
    }

    return sections.join("\n\n");
  }, [config]);

  const addFinalCommand = () => {
    setConfig({
      ...config,
      finalCommands: [
        ...config.finalCommands,
        { id: crypto.randomUUID(), value: "" },
      ],
    });
  };

  const setBaseImage = (id: string) => {
    let baseImage = available_images.find((i) => i.id == id);
    if (!baseImage) {
      baseImage = available_images[0]
    }
    setConfig({...config, baseImage: baseImage});
  }

  const updateFinalCommand = (id: string, value: string) => {
    const newCmds = config.finalCommands.map((cmd) =>
      cmd.id === id ? { ...cmd, value } : cmd,
    );
    setConfig({ ...config, finalCommands: newCmds });
  };

  const removeFinalCommand = (id: string) => {
    const newCmds = config.finalCommands.filter((cmd) => cmd.id !== id);
    setConfig({ ...config, finalCommands: newCmds });
  };

  const downloadDockerfile = () => {
    const blob = new Blob([dockerfileContent], {
      type: "application/octet-stream",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Dockerfile";
    document.body.appendChild(link);
    link.click();
    toast.success("Downloaded Dockerfile!");

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const applyDockerfile = () => {
    refresh?.();
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
                        These commands will be <strong>executed</strong> in the
                        coursework folder.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addFinalCommand}
                      className="h-8 gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Step
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto bg-accent p-4 border rounded-md">
                    {config.finalCommands.map((cmd, index) => (
                      <div key={cmd.id} className="flex gap-2">
                        <Input
                          value={cmd.value}
                          onChange={(e) =>
                            updateFinalCommand(cmd.id, e.target.value)
                          }
                          disabled={index === 0}
                          placeholder="e.g. ./setup.sh"
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFinalCommand(cmd.id)}
                          disabled={index === 0}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2 p-8 border-t bg-background">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => downloadDockerfile()}
              >
                <Download className="mr-2 w-4 h-4" /> Download Dockerfile
              </Button>
              <Button variant="default" className="w-full">
                <FileCheck
                  onClick={() => applyDockerfile()}
                  className="mr-2 w-4 h-4"
                />{" "}
                Apply Dockerfile
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
