"use client";

import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileCheck,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { TOOLS } from "@/lib/docker/tools";
import type { Image, Tool } from "@/lib/docker/types";
import { cn } from "@/lib/utils";

interface DockerConfig {
  baseImage: Image;
  workDir: string;
  installCommands: string[];
  additionalCommands: string[];
  envVars: { key: string; value: string }[];
  finalCommands: string[];
}

type DockerProps = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
};

export default function CreateDockerfile({
  open_state,
  set_open_state,
}: DockerProps) {
  const [config, setConfig] = useState<DockerConfig>({
    baseImage: IMAGES[0],
    workDir: "/work",
    installCommands: [],
    additionalCommands: [],
    envVars: [],
    finalCommands: ["cd /repo"],
  });

  const [showBuildCommands, setShowBuildCommands] = useState(false);
  const [showEnvVars, setShowEnvVars] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return TOOLS.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.id.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const dockerfileContent = useMemo(() => {
    const sections = [];

    sections.push(`FROM ${config.baseImage.id}`);
    sections.push(`WORKDIR ${config.workDir}`);

    const envStrings = config.envVars
      .filter((env) => env.key.trim() !== "")
      .map((env) => `ENV ${env.key}=${env.value}`)
      .join("\n");
    if (envStrings) sections.push(`${envStrings}`);

    const manager = config.baseImage.manager;
    const regularPackages: string[] = [];

    config.installCommands.forEach((id) => {
      const tool = TOOLS.find((t: Tool) => t.id === id);
      if (!tool) return;

      const { install } = tool;

      if (install.type === "package") {
        const packageName = install.packages[manager.id];
        if (packageName) {
          regularPackages.push(packageName);
        }
      } else if (install.type === "script") {
        sections.push(`RUN ${install.script}`);
        if (install.postInstall?.env) {
          Object.entries(install.postInstall.env).forEach(([key, value]) => {
            sections.push(`ENV ${key}="${value}"`);
          });
        }
      }
    });

    if (regularPackages.length > 0) {
      const installStr = regularPackages.join(" ");
      sections.push(
        `RUN ${manager.updateCmd} && ${manager.installCmd} ${installStr}`,
      );
    }

    const extraCommands = config.additionalCommands
      .filter((cmd: string) => (cmd || "").trim() !== "")
      .map((cmd: string) => `RUN ${cmd.trim()}`)
      .join("\n");

    if (extraCommands) {
      sections.push(`${extraCommands}`);
    }

    sections.push(`COPY . .`);

    const chainedCmd = config.finalCommands
      .filter((c) => c.trim() !== "")
      .join(" && ");

    if (chainedCmd) {
      sections.push(`CMD ["sh", "-c", ${JSON.stringify(chainedCmd)}]`);
    }

    return sections.join("\n\n");
  }, [config]);

  const toggleTool = (toolId: string) => {
    const exists = config.installCommands.includes(toolId);
    setConfig({
      ...config,
      installCommands: exists
        ? config.installCommands.filter((id) => id !== toolId)
        : [...config.installCommands, toolId],
    });
  };

  const updateImage = (image: Image) => {
    setConfig({ ...config, baseImage: image });
  };

  const updateCommand = (index: number, value: string) => {
    const newCommands = [...config.additionalCommands];
    newCommands[index] = value;
    setConfig({ ...config, additionalCommands: newCommands });
  };

  const addCommand = () => {
    setConfig({
      ...config,
      additionalCommands: [...config.additionalCommands, ""],
    });
  };

  const removeCommand = (index: number) => {
    const newCommands = config.additionalCommands.filter((_, i) => i !== index);
    setConfig({ ...config, additionalCommands: newCommands });
  };

  const addFinalCommand = () => {
    setConfig({ ...config, finalCommands: [...config.finalCommands, ""] });
  };

  const updateFinalCommand = (index: number, value: string) => {
    const newCmds = [...config.finalCommands];
    newCmds[index] = value;
    setConfig({ ...config, finalCommands: newCmds });
  };

  const removeFinalCommand = (index: number) => {
    const newCmds = config.finalCommands.filter((_, i) => i !== index);
    setConfig({ ...config, finalCommands: newCmds });
  };

  const addEnv = () => {
    setConfig({
      ...config,
      envVars: [...config.envVars, { key: "", value: "" }],
    });
  };

  const updateEnv = (index: number, field: "key" | "value", value: string) => {
    const newEnvs = [...config.envVars];
    newEnvs[index][field] = value;
    setConfig({ ...config, envVars: newEnvs });
  };

  const removeEnv = (index: number) => {
    const newEnvs = config.envVars.filter((_, i) => i !== index);
    setConfig({ ...config, envVars: newEnvs });
  };

  const highlightDockerfile = (code: string) => {
    const keywords =
      /^(FROM|WORKDIR|RUN|COPY|EXPOSE|CMD|ENV|ENTRYPOINT|ADD|VOLUME|USER|LABEL|ARG|CD)/gm;
    return code.split(keywords).map((part, _i) => {
      if (part.match(keywords)) {
        return (
          <span key={crypto.randomUUID()} className="text-blue-400 font-bold">
            {part}
          </span>
        );
      }
      return (
        <span key={crypto.randomUUID()} className="text-white">
          {part}
        </span>
      );
    });
  };

  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[80vh]! overflow-y-auto p-0 border-none bg-transparent shadow-none">
        <div className="flex flex-col-reverse lg:flex-row gap-6 w-full justify-center items-stretch">
          <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border rounded-xl shadow-lg justify-between flex flex-col">
            <div className="p-8 pb-0">
              <DialogTitle className="text-xl">
                Configure Dockerfile
              </DialogTitle>
              <p className="text-sm text-muted-foreground mb-6">
                Create a dockerfile for testing your coursework!
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
                  <Select
                    onValueChange={(value) => {
                      const selectedImage = IMAGES.find(
                        (img) => img.id === value,
                      );
                      if (selectedImage) updateImage(selectedImage);
                    }}
                    defaultValue={config.baseImage.id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an OS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {IMAGES.map((image) => (
                          <SelectItem key={image.id} value={image.id}>
                            {image.name}
                            <span className="ml-2 font-mono text-muted-foreground">
                              {image.id}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowTools(!showTools)}
                    className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity"
                  >
                    {showTools ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <div className="text-left">
                      <DialogTitle className="font-medium text-sm">
                        Install Languages / Tools
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        Required Languages or Tools for the environment.
                      </p>
                    </div>
                  </button>
                  {showTools && (
                    <div className="space-y-3 pl-6">
                      <div className="relative mb-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tools..."
                          className="pl-9 text-sm h-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-accent border">
                        {filteredTools.map((tool) => {
                          const isActive = config.installCommands.includes(
                            tool.id,
                          );
                          return (
                            <Card
                              key={tool.id}
                              onClick={() => toggleTool(tool.id)}
                              className={cn(
                                "px-4 py-3 cursor-pointer transition-all flex items-center gap-2 hover:border-primary select-none flex-row",
                                isActive
                                  ? "border-primary bg-primary/5"
                                  : "bg-card",
                              )}
                            >
                              {isActive && (
                                <Check className="w-3 h-3 text-primary" />
                              )}
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  isActive && "text-primary",
                                )}
                              >
                                {tool.name}{" "}
                                <span className="font-mono text-muted-foreground font-thin text-sm">
                                  {tool.id}
                                </span>
                              </span>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowBuildCommands(!showBuildCommands)}
                    className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity"
                  >
                    {showBuildCommands ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <div className="text-left">
                      <DialogTitle className="font-medium text-sm">
                        Build Commands
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        Extra commands that are ran to create the environment.{" "}
                        <strong>Dependencies</strong> go here.
                      </p>
                    </div>
                  </button>
                  {showBuildCommands && (
                    <div className="space-y-3 pl-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addCommand}
                        className="h-8 gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </Button>
                      <div className="space-y-2 max-h-32 overflow-y-auto bg-accent p-4 border">
                        {config.additionalCommands.map((cmd, index) => (
                          <div key={crypto.randomUUID()} className="flex gap-2">
                            <Input
                              value={cmd}
                              onChange={(e) =>
                                updateCommand(index, e.target.value)
                              }
                              placeholder="e.g. pip install torch"
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCommand(index)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowEnvVars(!showEnvVars)}
                    className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity"
                  >
                    {showEnvVars ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <div className="text-left">
                      <DialogTitle className="font-medium text-sm">
                        Environment Variables
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        Required environment variables for testing.
                      </p>
                    </div>
                  </button>
                  {showEnvVars && (
                    <div className="space-y-3 pl-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addEnv}
                        className="h-8 gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </Button>
                      <div className="space-y-2 max-h-32 overflow-y-auto p-4 bg-accent border">
                        {config.envVars.map((env, index) => (
                          <div key={crypto.randomUUID()} className="flex gap-2">
                            <Input
                              placeholder="Key"
                              value={env.key}
                              onChange={(e) =>
                                updateEnv(index, "key", e.target.value)
                              }
                              className="font-mono text-sm flex-1"
                            />
                            <Input
                              placeholder="Value"
                              value={env.value}
                              onChange={(e) =>
                                updateEnv(index, "value", e.target.value)
                              }
                              className="font-mono text-sm flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEnv(index)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                      <div key={crypto.randomUUID()} className="flex gap-2">
                        <Input
                          value={cmd}
                          onChange={(e) =>
                            updateFinalCommand(index, e.target.value)
                          }
                          disabled={index === 0}
                          placeholder="e.g. ./setup.sh"
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFinalCommand(index)}
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
              <Button variant="outline" className="w-full">
                <Download className="mr-2 w-4 h-4" /> Download Dockerfile
              </Button>
              <Button variant="default" className="w-full">
                <FileCheck className="mr-2 w-4 h-4" /> Apply Dockerfile
              </Button>
            </div>
          </div>

          <div className="lg:max-h-[80vh]! flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-8 shadow-lg flex flex-col">
            <div className="flex justify-start gap-4 items-center mb-6">
              <DialogTitle className="text-xl text-white">Preview</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                className="text-white border-zinc-700 hover:bg-zinc-800"
                onClick={() => navigator.clipboard.writeText(dockerfileContent)}
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
            <pre className="font-mono overflow-y-auto flex-1 whitespace-pre-wrap leading-relaxed text-[13px]">
              {highlightDockerfile(dockerfileContent)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
