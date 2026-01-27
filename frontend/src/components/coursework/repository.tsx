import { DropdownCard } from "@/components/dropdown-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilePlus, Gitlab } from "lucide-react";
import File from "@/components/coursework/file";

export default function Repository() {
  return (
    <DropdownCard
      openByDefault={true}
      title={"Repository"}
      desc={"Your coursework's files are displayed here."}
    >
      <div className="flex flex-col w-full gap-2">
        <div className="flex flex-row gap-2">
          <Input defaultValue={"Search for a file..."}></Input>
          <Button variant={"default"}>
            <FilePlus></FilePlus> Upload File
          </Button>
          <Button
            variant={"default"}
            className="bg-linear-to-r from-[#e24329] via-[#fc6d26] to-[#fca326] text-white font-medium py-2 px-4 transition-all duration-200 hover:brightness-110 active:brightness-90"
          >
            <Gitlab></Gitlab> Gitlab
          </Button>
        </div>
        {/* Files */}
        <div className="flex flex-col gap-2 bg-accent border p-2 overflow-y-scroll h-64">
          <File
            fileName="main.c"
            fileDate="27/01/2026"
            fileSize="2.4MB"
            fileMarked={true}
          ></File>
          <File
            fileName="main.h"
            fileDate="27/01/2026"
            fileSize="2.4MB"
            fileMarked={false}
          ></File>
        </div>
      </div>
    </DropdownCard>
  );
}
