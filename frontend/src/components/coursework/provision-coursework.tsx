"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { provision_individual_projects } from "@/lib/actions/provision_individual_projects";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

type GitlabData = {
    name: string;
    coursework_id: string;
    template_id: string;
};

type DockerProps = {
    open_state: boolean;
    set_open_state: Dispatch<SetStateAction<boolean>>;
    gitlab_data: GitlabData;
};

export default function ProvisionCoursework({
    open_state,
    set_open_state,
    gitlab_data,
}: DockerProps) {

    const [loadingState, setLoadingState] = useState<boolean>(false);
    const [status, setStatus] = useState<number>(0);


    const provisionForIndividuals = async (gitlab_data: GitlabData) => {
        const req = {
            name: gitlab_data.name,
            coursework_id: gitlab_data.coursework_id,
            template_id: gitlab_data.template_id,
        };
        try {
            setLoadingState(true)
            setStatus(1)
            const result = await provision_individual_projects(req)
            setLoadingState(false)
            if (result.success) {
                setStatus(2)
                toast.success("Projects successfully provisioned")
            } else {
                toast.success("Failed to provision projects")
            }
        } catch (_error) {
            toast.error("Failed to provision")
        }

    }

    return (
        <Dialog open={open_state} onOpenChange={set_open_state}>
            <DialogContent className="max-w-[90%]! xl:max-w-[60%]! w-full max-h-full! lg:max-h-[70vh]! overflow-y-auto p-0">
                <div className="flex flex-col gap-6 w-full justify-center items-stretch">
                    <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border rounded-xl justify-between flex flex-col">
                        <div className="p-8 pb-0">
                            <DialogTitle className="text-xl">
                                Provision Coursework
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mb-6">
                                Decide how to provision courseworks
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row mx-10 gap-8 justify-between mb-10">
                        <div className="flex flex-col flex-1 gap-2">
                            <p className="text-lg font-semibold">Provision for Individuals</p>
                            <p className="text-sm text-muted-foreground">
                                Provision one repository for all students on the unit
                            </p>
                            <div className="flex flex-col gap-2">

                                {(status === 0 && !loadingState) && (
                                    <Button
                                        onClick={() => provisionForIndividuals(gitlab_data)}
                                        variant="outline"
                                        className="w-full mt-4"
                                    >
                                        Provision for Individuals
                                    </Button>
                                )}

                                {(status === 1 && !loadingState) && (
                                    <Button className="w-full mt-4">
                                        <Spinner className="mr-2 h-4 w-4" />
                                    </Button>
                                )}

                                {(loadingState) && (
                                    <Button disabled className="w-full mt-4">
                                        <Spinner className="mr-2 h-4 w-4" />
                                        Provisioning...
                                    </Button>
                                )
                                }

                                {(status === 2 && !loadingState) && (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full border-green-500 text-green-600 cursor-default"
                                        disabled
                                    >
                                        ✓ All projects provisioned
                                    </Button>
                                )}


                            </div>
                        </div>

                        <div className="md:w-px md:h-auto h-px w-full bg-border self-stretch" />

                        <div className="flex flex-col flex-1 gap-2">
                            <p className="text-lg font-semibold">Provision for Teams</p>
                            <p className="text-sm text-muted-foreground">
                                Drop in your teams using our CSV guide
                            </p>
                            <div className="flex flex-col gap-2 mt-auto pt-4">
                                <Button variant="outline" disabled className="w-full">
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
        </Dialog>
    );
}
