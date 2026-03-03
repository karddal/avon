
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
import { toast } from "sonner";
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
    additionalCommands: { id: string; value: string }[];
    envVars: { id: string; key: string; value: string }[];
    finalCommands: { id: string; value: string }[];
}

type DockerProps = {
    open_state: boolean;
    set_open_state: Dispatch<SetStateAction<boolean>>;
};

export default function ProvisionCoursework({
    open_state,
    set_open_state,
}: DockerProps) {
    return (
        <Dialog open={open_state} onOpenChange={set_open_state}>
            <DialogContent className="max-w-full! lg:max-w-[70%]! xl:max-w-[60%]! w-full max-h-full! lg:max-h-[70vh]! overflow-y-auto p-0 border-none shadow-none">
                <div className="flex flex-col-reverse lg:flex-col gap-6 w-full justify-center items-stretch">
                    <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border rounded-xl shadow-lg justify-between flex flex-col">
                        <div className="p-8 pb-0">
                            <DialogTitle className="text-xl">
                                Provision Coursework
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mb-6">
                                Decide how to provision courseworks
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row mx-10 gap-8 justify-between mb-10">
                        <div className="flex flex-col flex-1 gap-2">
                            <p className="text-lg font-semibold">Provision for Individuals</p>
                            <p className="text-sm text-muted-foreground">Provision one repository for all students on the unit</p>
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" className="w-full mt-4">
                                    Provision for Individuals
                                </Button>
                            </div>

                        </div>

                        <div className="w-px bg-border self-stretch" />

                        <div className="flex flex-col flex-1 gap-2">
                            <p className="text-lg font-semibold">Provision for Teams</p>
                            <p className="text-sm text-muted-foreground">Drop in your teams using our CSV guide</p>
                            <div className="flex flex-col gap-2 mt-auto pt-4">
                                <Button variant="outline" className="w-full">
                                    Upload CSV
                                </Button>
                                <Button variant="outline" disabled className="w-full">
                                    Provision for Teams
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
